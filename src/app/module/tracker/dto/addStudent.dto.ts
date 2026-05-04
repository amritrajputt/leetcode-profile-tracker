import { BaseDto } from "../../../common/dto/base.dto.js";
import Joi from "joi";

export class AddStudentDto extends BaseDto {
    static schema = Joi.object({
        name: Joi.string().min(2).max(50).trim().required(),
        rollNumber: Joi.string().min(5).max(25).trim().required(),
        accessCode: Joi.string().trim().required(),
        batchYear: Joi.number().min(new Date().getFullYear()).max(new Date().getFullYear()+4).required(),
        email: Joi.string().email().trim().required(),
        course: Joi.string().trim().required(),
        branch: Joi.string().trim().required(),
        section: Joi.string().trim().required(),
        leetcodeUserName: Joi.string().optional(),
        geeksforgeeksUserName: Joi.string().optional(),
    }).or('leetcodeUserName', 'geeksforgeeksUserName');
}