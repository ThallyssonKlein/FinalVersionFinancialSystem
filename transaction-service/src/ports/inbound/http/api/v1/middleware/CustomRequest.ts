import IToken from "@ports/outbound/database/token/IToken";
import { Request } from "express";

export default interface CustomRequest extends Request {
    traceId?: string;
    token?: IToken;
}