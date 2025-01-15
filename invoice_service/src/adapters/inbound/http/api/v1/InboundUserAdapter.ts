import IUserDAO, { IBalances } from "@ports/outbound/postgresql/user/IUserDAO";
import IOutboundUserDTO from "@ports/inbound/http/api/v1/dto/IOutboundUserDTO";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import NotFoundError from "@ports/inbound/http/api/v1/error/NotFoundError";
import ForbiddenError from "@ports/inbound/http/api/v1/error/ForbiddenError";
import IOutboundLoginDTO from '@ports/inbound/http/api/v1/dto/IOutboundLoginDTO';
import Loggable from "@shared/Loggable";
import OutboundUserRepositoryPort from "@ports/outbound/postgresql/user/OutboundUserRepositoryPort";
import IBalancesDTO from "@ports/inbound/http/api/v1/dto/IBalancesDTO";
import IOutboundResumedUserDTO from "@ports/inbound/http/api/v1/dto/IOutboundResumedUserDTO";
import WithdrawService from "@domain/user/service/WithdrawService";
import InsufficientBalanceError from "@domain/user/error/InsufficientBalanceError";
import { BadRequestError, InternalError } from "@ports/inbound/http/api/v1/error";
import IInboundUserDTO from "@ports/inbound/http/api/v1/dto/IInboundUserDTO";
import PaginatedResultsDTO from "@ports/inbound/http/api/v1/dto/PaginatedResultsDTO";
import OutboundLocalStoragePort from "@ports/outbound/storage/OutboundLocalStoragePort";

export default class InboundUserAdapter extends Loggable {
    constructor(
        private outboundUserRepositoryPort: OutboundUserRepositoryPort,
        private withdrawService: WithdrawService,
        private outboundLocalStoragePort: OutboundLocalStoragePort,

    ) {
        super("InboundUserAdapter");
    }

    async updateUserById(
        id: number, 
        traceId: string, 
        dto: IInboundUserDTO,
        file?: Express.Multer.File
    ): Promise<void> {
        const findUserResult = await this.outboundUserRepositoryPort.findUserById(id);

        if (findUserResult.length === 0) {
            this.log.error(`User with id '${id}' not found`, traceId);
            throw new NotFoundError('User not found');
        }

        this.log.info(`User with id '${id}' found`, traceId);

        if (dto !== null && dto !== undefined && dto.username) {
            const anotherUserWithNewUsername = await this.outboundUserRepositoryPort.findUserByUsername(dto.username);

            if (anotherUserWithNewUsername.length > 0) {
                this.log.error(`Username already in use`, traceId);
                throw new BadRequestError("Username already in use");
            }
        }

        if (dto !== null && dto !== undefined && dto.username) {
            const anotherUserWithNewEmail = await this.outboundUserRepositoryPort.findUserByEmail(dto.email);

            if (anotherUserWithNewEmail.length > 0) {
                this.log.error(`Email already in use`, traceId);
                throw new BadRequestError("Email already in use");
            }
        }

        let photoURL
        if (file != null && file != undefined) {
            this.log.info(`Uploading profile picture for user with id '${id}'`, traceId);
            photoURL = await this.outboundLocalStoragePort.uploadProfilePicture(file, traceId);
        }

        await this.outboundUserRepositoryPort.updateUser(id, dto, photoURL)

        this.log.info(`User with id '${id}' updated successfully.`, traceId);
    }

    async register(dto: IInboundUserDTO, traceId: string): Promise<IOutboundUserDTO> {
        this.log.info(`User creation`, traceId);
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(dto.password, saltRounds);
        dto.password = hashedPassword;

        const user: IUserDAO[] = await this.outboundUserRepositoryPort.findUserByUsernameOrEmail(dto.username, dto.email);

        if (user.length > 0) {
            throw new BadRequestError("User already exists!")
        }

        await this.outboundUserRepositoryPort.registerUser(dto);

        this.log.info(`User created!`, traceId);

        const userAfterSave: IUserDAO[] = await this.outboundUserRepositoryPort.findUserByUsernameWithAllFields(dto.username)

        if (userAfterSave.length === 0) {
            this.log.error("Error finding user by username")
            throw new InternalError()
        }

        return this.mapIUserDAOToIOutboundUserDTO(userAfterSave[0])
    }

    async login(username: string, password: string, traceId: string): Promise<IOutboundLoginDTO> {
        const userFindResult = await this.outboundUserRepositoryPort.findUserByUsernameWithAllFields(username);
        this.log.info(`User ${username} found`, traceId);

        if (userFindResult.length === 0) {
            this.log.error(`User ${username} not found`, traceId);
            throw new NotFoundError('User not found');
        }

        const validPassword = await bcrypt.compare(password, userFindResult[0].password);

        if (!validPassword) {
            this.log.error(`Invalid password for user ${username}`, traceId);
            throw new ForbiddenError('Invalid password');
        }

        const token = jwt.sign({ id: userFindResult[0].id }, process.env.JWT_SECRET);
        this.log.info(`User ${username} logged in`, traceId);

        return {
            token,
            user: this.mapIUserDAOToIOutboundUserDTO(userFindResult[0])
        } as IOutboundLoginDTO;
    }

    async logicalDelete(userId: number, traceId: string): Promise<void> {
        await this.outboundUserRepositoryPort.logicalDelete(userId);
        this.log.info(`User ${userId} logically deleted`, traceId);
    }

    async get(id: number): Promise<IOutboundUserDTO> {
        const resultFromRepository = await this.outboundUserRepositoryPort.findUserById(id);

        if (resultFromRepository.length === 0) {
            throw new NotFoundError('User not found');
        }

        return this.mapIUserDAOToIOutboundUserDTO(resultFromRepository[0]);
    }

    private mapIBalancesToIBalancesDTO(balances: IBalances): IBalancesDTO {
        return {
            btcBalance: balances.btc_balance,
            brlBalance: balances.brl_balance
        }
    }

    async getBalances(userId: number, traceId: string): Promise<IBalancesDTO> {
        const result: IBalances[] = await this.outboundUserRepositoryPort.getBalances(userId);

        if (result.length === 0) {
            throw new NotFoundError('User not found');
        }

        const balances = result[0];

        this.log.info("Balances found: " + JSON.stringify(balances), traceId);

        return this.mapIBalancesToIBalancesDTO(balances);
    }

    private mapIUserDAOToIOutboundUserDTO(user: IUserDAO): IOutboundUserDTO {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            isDeleted: user.is_deleted,
            btcBalance: user.btc_balance,
            brlBalance: user.brl_balance,
            photoUrl: user.photo_url,
            xUsername: user.x_username,
            instagramUsername: user.instagram_username,
            facebookUsername: user.facebook_username,
            nostrUsername: user.nostr_username,
            telegramUsername: user.telegram_username,
            whatsappUsername: user.whatsapp_username,
            youtubeUsername: user.youtube_username,
            twitchUsername: user.twitch_username
        }
    }

    private mapIUserDAOToIOutboundResumedUserDTO(user: IUserDAO): IOutboundResumedUserDTO {
        return {
            id: user.id,
            username: user.username,
            photoURL: user.photo_url,
            xUsername: user.x_username,
            instagramUsername: user.instagram_username,
            facebookUsername: user.facebook_username,
            nostrUsername: user.nostr_username,
            telegramUsername: user.telegram_username,
            whatsappUsername: user.whatsapp_username,
            youtubeUsername: user.youtube_username,
            twitchUsername: user.twitch_username
        }
    }

    async getUserByUsername(username: string, traceId: string): Promise<IOutboundResumedUserDTO> {
        const resultFromRepository = await this.outboundUserRepositoryPort.findUserByUsername(username);
        this.log.info(`User ${username} found`, traceId);

        if (resultFromRepository.length === 0) {
            this.log.error(`User ${username} not found`, traceId);
            throw new NotFoundError('User not found');
        }

        return this.mapIUserDAOToIOutboundResumedUserDTO(resultFromRepository[0]);
    }

    async pixWithdraw(userId: number, amount: string, pixKey: string, traceId: string): Promise<void> {
        try {
            await this.withdrawService.pixWithdraw(userId, amount, pixKey, traceId);
        } catch (err) {
            if (err instanceof InsufficientBalanceError) {
                throw new BadRequestError("Insufficient balance");
            } else {
                throw err;
            }
        }
    }

    async btcWithdraw(userId: number, invoice: string, traceId: string): Promise<void> {
        try {
            await this.withdrawService.btcWithdraw(userId, invoice, traceId);
        } catch (err) {
            if (err instanceof InsufficientBalanceError) {
                throw new BadRequestError("Insufficient balance");
            } else {
                throw err;
            }
        }
    }

    async virtualWithdraw(userId: number, amount: string, currency: "BTC" | "BRL", traceId: string): Promise<void> {
        try {
            await this.withdrawService.virtualWithdraw(userId, Number(amount), currency, traceId);
            this.log.info(`Virtual withdraw created for user ${userId}`, traceId);
        } catch (err) {
            if (err instanceof InsufficientBalanceError) {
                throw new BadRequestError("Insufficient balance");
            } else {
                throw err;
            }
        }
    }

    async removePhoto(userId: number, traceId: string) {
        const userPhotoName = await this.getUserPhoto(userId, traceId);
        await this.outboundLocalStoragePort.deleteProfilePicture(userPhotoName, traceId);
        await this.outboundUserRepositoryPort.removePhoto(userId);
        this.log.info("Photo removed for user with id: " + userId, traceId)
    }

    async getAllPaginated(page: number, limit: number, traceId: string): Promise<PaginatedResultsDTO> {
        const result = await this.outboundUserRepositoryPort.getAllPaginated(page, limit);
        this.log.info("Users found: " + JSON.stringify(result), traceId);

        const resultsToReturn: IOutboundResumedUserDTO[] = result.map(this.mapIUserDAOToIOutboundResumedUserDTO);

        const totalRecords = await this.outboundUserRepositoryPort.countAllUsers();

        return new PaginatedResultsDTO(resultsToReturn, Number(totalRecords), Math.ceil(totalRecords / limit));
    }

    private extractUserPhotoFileName(photoUrl: string): string {
        const urlParts = photoUrl.split('/');
        return urlParts[urlParts.length - 1];
    }

    async getUserPhoto(userId: number, traceId: string): Promise<string> {
        const result = await this.outboundUserRepositoryPort.getUserPhoto(userId);

        if (result.length === 0) {
            this.log.error("Photo not found for user with id: " + userId, traceId);
            throw new NotFoundError("Photo not found");
        }

        console.log(result)

        this.log.info("Photo found for user with id: " + userId, traceId);

        return this.extractUserPhotoFileName(result[0].photo_url);
    }
}