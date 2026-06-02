import prisma from '../utils/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import CustomError from '../utils/CustomError.js';



async function generateRefreshToken(userId) {
    const tokenUuid = uuidv4();
    const secret = uuidv4();

    // 3 hours
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);

    const hashedRefreshToken = await bcrypt.hash(secret, 12);

    await prisma.refreshTokens.create({
        data: {
            userId,
            tokenUuid,
            hashedRefreshToken,
            expiresAt
        }
    });

    return `${tokenUuid}.${secret}`;
}


async function verifyRefreshToken(refreshToken) {
    if (!refreshToken) throw new CustomError("Invalid token", 401);

    const [tokenUuid, secret] = refreshToken.split('.');

    const record = await prisma.refreshTokens.findUnique({
        where: { tokenUuid },
        select: {
            hashedRefreshToken: true,
            expiresAt: true,
            userId: true
        }
    });

    if (!record) throw new CustomError("Invalid token", 401);

    const isValid = await bcrypt.compare(secret, record.hashedRefreshToken);
    if (!isValid) throw new CustomError("Invalid token", 401);

    if (record.expiresAt < new Date()) {
        await prisma.refreshTokens.delete({
            where: { tokenUuid }
        });
        throw new CustomError("Token expired", 401);
    }

    return { userId: record.userId, tokenUuid };
}



async function login(usernameOrEmail, password) {
    if (!usernameOrEmail || !password)
        throw new CustomError("Missing credentials", 400);

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        },
        select: {
            id: true,
            hashedPassword: true
        }
    });

    if (!user)
        throw new CustomError("Invalid credentials", 401);

    const match = await bcrypt.compare(password, user.hashedPassword);

    if (!match)
        throw new CustomError("Invalid credentials", 401);

    const refresh_token = await generateRefreshToken(user.id);

    return {
        userId: user.id,
        refresh_token
    };
}



async function signup(username, email, password) {
    if (!username || !email || !password)
        throw new CustomError("Missing fields", 400);

    try {
        const result = await prisma.$transaction(async (tx) => {
            const hashedPassword = await bcrypt.hash(password, 12);

            const user = await tx.user.create({
                data: {
                    username,
                    email,
                    hashedPassword
                },
                select: { id: true }
            });


            await tx.folder.create({
                data: {
                    name: 'root',
                    ownerId: user.id,
                    parentId: null
                }
            });

            return user;
        });

        return { user_id: result.id };

    } catch (err) {
        if (err.code === 'P2002') {
            throw new CustomError(
                `${err.meta.target.join(', ')} already exists`,
                409
            );
        }
        throw err;
    }
}



async function logout(refreshToken) {
    const { tokenUuid, userId } = await verifyRefreshToken(refreshToken);

    await prisma.refreshTokens.delete({
        where: { tokenUuid }
    });

    return { userId };
}



export default {
    login,
    signup,
    logout,
    verifyRefreshToken
};