import prisma from '../utils/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import CustomError from '../utils/CustomError.js';


async function generateRefreshToken(userId) {
    const tokenUuid = uuidv4();
    const secret = uuidv4();
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // token expire after 3 minutes just for testing
    const hashedRefreshToken = await bcrypt.hash(secret, 12);
    await prisma.refreshTokens.create({
        data: {
            userId,
            tokenUuid,
            hashedRefreshToken,
            expiresAt
        }
    });
    const refresh_token = tokenUuid + "." + secret;
    return refresh_token;
}


async function verifyRefreshToken(refreshToken) {
    const [tokenUuid, secret] = refreshToken.split('.');
    const res = await prisma.refreshTokens.findUnique({
        where: { tokenUuid },
        select: { hashedRefreshToken: true, expiresAt: true, userId: true }
    });
    if (!res) throw new CustomError("Invalid token", 401);
    const match = await bcrypt.compare(secret, res.hashedRefreshToken);
    if (!match) throw new CustomError("Invalid token", 401);
    if (Date.now() > res.expiresAt.getTime()) {
        await prisma.refreshTokens.delete({ where: { tokenUuid } });
        throw new CustomError("Invalid token", 401);
    }
    return { userId: res.userId };
}

async function login(usernameOrEmail, password) {
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        },
        select: { hashedPassword: true, id: true }
    });
    if (!user)
        throw new CustomError("Invalid credentials", 401);
    const match = await bcrypt.compare(password, user.hashedPassword);
    if (!match)
        throw new CustomError("Invalid credentials", 401);
    const refresh_token = await generateRefreshToken(user.id);
    return { userId: user.id, refresh_token };

}

async function signup(username, email, password) {
    try {

        const res = await prisma.$transaction(async (tx) => {
            const hashedPassword = await bcrypt.hash(password, 12);
            const current_user = await tx.user.create({
                data: {
                    username,
                    email,
                    hashedPassword
                },
                select: { id: true }
            });
            const root = await tx.folder.create({
                data: {
                    name: 'root',
                    ownerId: current_user.id
                },
                select: { id: true }
            });
            await tx.root.create({
                data: {
                    folderId: root.id,
                    userId: current_user.id
                }
            });
            return current_user;
        });
        if (!res) throw new CustomError("Error in signup");
        return { user_id: res.id };
    }
    catch (err) {
        if (err.code === 'P2002')
            throw new CustomError(`${err.meta.target.join(', ')} already exists`, 409);
        throw err;
    }

}
async function logout(refreshToken) {
    const user = await verifyRefreshToken(refreshToken);
    await prisma.refreshTokens.delete({ where: { tokenUuid: refreshToken.split('.')[0] } });
    return user;
}



export default { login, signup, logout, verifyRefreshToken };