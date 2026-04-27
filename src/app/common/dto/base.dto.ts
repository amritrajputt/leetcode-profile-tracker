import Joi from "joi";

export class BaseDto {
    static schema = Joi.object({})

    static validate(data: any) {
        const { error, value } = this.schema.validate(data, { abortEarly: false, stripUnknown: true })

        if (error) {
            const errorMsg = error.details.map((d: any) => d.message).join(",");
            return { error: errorMsg, data: null }
        }

        return { data: value, error: null };

    }
}