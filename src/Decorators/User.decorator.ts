import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { create } from "domain";

export const user = createParamDecorator((data: unknown,ctx : ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
})  