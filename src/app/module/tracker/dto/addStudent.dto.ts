import { BaseDto } from "../../../common/dto/base.dto.js";
import Joi from "joi";

export class AddStudentDto extends BaseDto {
    static schema = Joi.object({
        name: Joi.string().required().min(2).max(50).trim().required(),
        rollNumber: Joi.string().required().min(13).max(25).trim().required(),
        batchYear: Joi.number().required().min(new Date().getFullYear() - 5).max(new Date().getFullYear()).required(),
        email: Joi.string().required().email().trim().required(),
        course: Joi.string().required().trim().required(),
        branch: Joi.string().required().trim().required(),
        section: Joi.string().required(),
        leetcodeUserName: Joi.string().optional().allow(null),
        geeksforgeeksUserName: Joi.string().optional().allow(null),
    }).or('leetcodeUserName', 'geeksforgeeksUserName');
}