const userModel = require("../models/UserModel.js");
const MailService = require("./MailService.js");
const tokenService = require("./TokenService.js");
const UserDto = require("../dtos/UserDto.js");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const UserModel = require("../models/UserModel.js");
const ApiError = require("../exceptions/ApiError.js");
const BasketController = require("../controllers/BasketController.js");

class UserService {
  async registration(email, password, admin) {
    //check if email exist
    const candidate = await userModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(`Користувач за таким Email вже існує ${email}`);
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4();
    //create user and send mail
    const user = await userModel.create({
      email,
      password: hashPassword,
      admin,
    });
    // await MailService.sendAcivationMail(
    //   email,
    //   `${process.env.API_URL}/api/user/activate/${activationLink}`
    // );
    //create userModel(Dto) and tokens

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    const basket = BasketController.create(userDto.id);
    return {
      ...tokens,
      user: userDto,
      basket: basket,
    };
  }

  async activate() {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest("Силка для активації не коректна");
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return ApiError.BadRequest("Користувача з таким email не знайдено");
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      return ApiError.BadRequest("Невірний пароль");
    }
    const userDto = new UserDto(user);

    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    console.log(user);
    return {
      ...tokens,
      user: userDto,
    };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new ApiError.UnauthorizedError();
    }

    try {
      const userData = tokenService.validateRefreshToken(refreshToken);

      const tokenFromDb = await tokenService.findToken(refreshToken);
      if (!userData || !tokenFromDb) {
      }

      const user = await UserModel.findById(userData.id);

      const userDto = new UserDto(user);

      const tokens = tokenService.generateTokens({ ...userDto });
      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      return { ...tokens, user: userDto };
    } catch (error) {
      console.error("Error in refresh:", error);
      throw error;
    }
  }
  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }
}

module.exports = new UserService();
