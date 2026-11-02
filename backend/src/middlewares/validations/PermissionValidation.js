import validate from './validate.js';
import { body, param } from 'express-validator';
import permissionService from '../../services/permissionService.js';

function requireTargetUser() {
    return body().custom((value, { req }) => {
        if (!req.body.targetUserId && !req.body.targetUserEmail) {
            throw new Error('targetUserId or targetUserEmail is required');
        }
        return true;
    });
}

function validatePermissionAction() {
    const validations = [
        body('objectType')
            .trim()
            .isIn(permissionService.VALID_OBJECT_TYPES)
            .withMessage(`objectType must be one of: ${permissionService.VALID_OBJECT_TYPES.join(', ')}`),
        body('objectId')
            .trim()
            .notEmpty()
            .withMessage('objectId is required'),
        body('role')
            .trim()
            .isIn(permissionService.VALID_ROLES)
            .withMessage(`role must be one of: ${permissionService.VALID_ROLES.join(', ')}`),
        body('targetUserId')
            .optional()
            .trim()
            .isString()
            .withMessage('targetUserId must be a string'),
        body('targetUserEmail')
            .optional()
            .trim()
            .isEmail()
            .withMessage('targetUserEmail must be a valid email'),
        requireTargetUser()
    ];

    return validate(validations);
}

function validatePermissionDelete() {
    const validations = [
        body('objectType')
            .trim()
            .isIn(permissionService.VALID_OBJECT_TYPES)
            .withMessage(`objectType must be one of: ${permissionService.VALID_OBJECT_TYPES.join(', ')}`),
        body('objectId')
            .trim()
            .notEmpty()
            .withMessage('objectId is required'),
        body('targetUserId')
            .optional()
            .trim()
            .isString()
            .withMessage('targetUserId must be a string'),
        body('targetUserEmail')
            .optional()
            .trim()
            .isEmail()
            .withMessage('targetUserEmail must be a valid email'),
        requireTargetUser()
    ];

    return validate(validations);
}

function validatePermissionQuery() {
    const validations = [
        param('objectType')
            .trim()
            .isIn(permissionService.VALID_OBJECT_TYPES)
            .withMessage(`objectType must be one of: ${permissionService.VALID_OBJECT_TYPES.join(', ')}`),
        param('objectId')
            .trim()
            .notEmpty()
            .withMessage('objectId is required')
    ];

    return validate(validations);
}

export default {
    validatePermissionAction,
    validatePermissionDelete,
    validatePermissionQuery
};
