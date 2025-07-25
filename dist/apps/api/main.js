/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const app_controller_1 = __webpack_require__(5);
const app_service_1 = __webpack_require__(6);
const auth_module_1 = __webpack_require__(7);
const database_module_1 = __webpack_require__(33);
const companies_module_1 = __webpack_require__(49);
const company_context_module_1 = __webpack_require__(54);
const writer_profiles_module_1 = __webpack_require__(58);
const content_topics_module_1 = __webpack_require__(62);
const blog_posts_module_1 = __webpack_require__(66);
const social_media_module_1 = __webpack_require__(79);
const content_library_module_1 = __webpack_require__(84);
const version_control_module_1 = __webpack_require__(73);
const rbac_module_1 = __webpack_require__(77);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, auth_module_1.AuthModule, companies_module_1.CompaniesModule, company_context_module_1.CompanyContextModule, writer_profiles_module_1.WriterProfilesModule, content_topics_module_1.ContentTopicsModule, blog_posts_module_1.BlogPostsModule, social_media_module_1.SocialMediaModule, content_library_module_1.ContentLibraryModule, version_control_module_1.VersionControlModule, rbac_module_1.RBACModule],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const app_service_1 = __webpack_require__(6);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getData() {
        return this.appService.getData();
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getData", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
let AppService = class AppService {
    getData() {
        return { message: 'Hello API' };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const jwt_1 = __webpack_require__(8);
const passport_1 = __webpack_require__(9);
const typeorm_1 = __webpack_require__(10);
const auth_service_1 = __webpack_require__(11);
const auth_controller_1 = __webpack_require__(25);
const jwt_strategy_1 = __webpack_require__(29);
const local_strategy_1 = __webpack_require__(31);
const user_entity_1 = __webpack_require__(14);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'your-secret-key',
                signOptions: { expiresIn: '24h' },
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, local_strategy_1.LocalStrategy, jwt_strategy_1.JwtStrategy],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(12);
const jwt_1 = __webpack_require__(8);
const bcrypt = tslib_1.__importStar(__webpack_require__(13));
const user_entity_1 = __webpack_require__(14);
let AuthService = class AuthService {
    constructor(jwtService, userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }
    async validateUser(email, password) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (user && user.password && await bcrypt.compare(password, user.password)) {
            const { password: _, ...result } = user;
            return result;
        }
        return null;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = { email: user.email, sub: user.id, role: user.role };
        // Update last login
        await this.userRepository.update(user.id, { lastLoginAt: new Date() });
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.isActive,
                permissions: user.permissions,
                lastLoginAt: user.lastLoginAt,
                companyId: user.companyId
            }
        };
    }
    async register(registerDto) {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: { email: registerDto.email }
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const newUser = this.userRepository.create({
            email: registerDto.email,
            name: registerDto.name,
            password: hashedPassword,
            role: 'Guest'
        });
        const savedUser = await this.userRepository.save(newUser);
        const payload = { email: savedUser.email, sub: savedUser.id, role: savedUser.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: savedUser.id,
                email: savedUser.email,
                name: savedUser.name,
                role: savedUser.role,
                isActive: savedUser.isActive,
                permissions: savedUser.permissions,
                lastLoginAt: savedUser.lastLoginAt,
                companyId: savedUser.companyId
            }
        };
    }
    async validateUserById(userId) {
        return this.userRepository.findOne({ where: { id: userId } });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], AuthService);


/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const shared_1 = __webpack_require__(15);
const company_entity_1 = __webpack_require__(24);
let User = class User {
};
exports.User = User;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], User.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", String)
], User.prototype, "email", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "name", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "password", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        default: 'Guest'
    }),
    tslib_1.__metadata("design:type", typeof (_a = typeof shared_1.UserRole !== "undefined" && shared_1.UserRole) === "function" ? _a : Object)
], User.prototype, "role", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        transformer: {
            to: (value) => value ? JSON.stringify(value) : null,
            from: (value) => value ? JSON.parse(value) : null,
        }
    }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], User.prototype, "platformAccessRights", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'json',
        nullable: true
    }),
    tslib_1.__metadata("design:type", Array)
], User.prototype, "permissions", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], User.prototype, "lastLoginAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    tslib_1.__metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "companyId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'companyId' }),
    tslib_1.__metadata("design:type", typeof (_d = typeof company_entity_1.Company !== "undefined" && company_entity_1.Company) === "function" ? _d : Object)
], User.prototype, "company", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], User.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_f = typeof Date !== "undefined" && Date) === "function" ? _f : Object)
], User.prototype, "updatedAt", void 0);
exports.User = User = tslib_1.__decorate([
    (0, typeorm_1.Entity)('users')
], User);


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(4);
tslib_1.__exportStar(__webpack_require__(16), exports);
tslib_1.__exportStar(__webpack_require__(22), exports);
tslib_1.__exportStar(__webpack_require__(23), exports);


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(4);
tslib_1.__exportStar(__webpack_require__(17), exports);
tslib_1.__exportStar(__webpack_require__(18), exports);
tslib_1.__exportStar(__webpack_require__(19), exports);
tslib_1.__exportStar(__webpack_require__(20), exports);
tslib_1.__exportStar(__webpack_require__(21), exports);


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ROLE_PERMISSIONS = void 0;
// Predefined Role Permissions
exports.ROLE_PERMISSIONS = {
    Admin: [
        // Full access to everything
        'content:create', 'content:read', 'content:update', 'content:delete',
        'content:approve', 'content:publish', 'content:archive',
        'library:read', 'library:manage', 'library:sync',
        'profiles:create', 'profiles:read', 'profiles:update', 'profiles:delete',
        'company:read', 'company:update', 'company:manage',
        'social:create', 'social:read', 'social:update', 'social:delete',
        'social:approve', 'social:publish',
        'version:read', 'version:restore', 'version:compare',
        'comments:create', 'comments:read', 'comments:update', 'comments:delete',
        'users:read', 'users:create', 'users:update', 'users:delete', 'users:assign_roles',
        'system:read', 'system:update'
    ],
    Editor: [
        // Content creation and management
        'content:create', 'content:read', 'content:update', 'content:delete',
        'library:read', 'library:manage',
        'profiles:create', 'profiles:read', 'profiles:update',
        'company:read', 'company:update',
        'social:create', 'social:read', 'social:update', 'social:delete',
        'version:read', 'version:restore', 'version:compare',
        'comments:create', 'comments:read', 'comments:update', 'comments:delete'
    ],
    Reviewer: [
        // Review and approve content
        'content:read', 'content:approve', 'content:archive',
        'library:read',
        'profiles:read',
        'company:read',
        'social:read', 'social:approve',
        'version:read', 'version:compare',
        'comments:create', 'comments:read', 'comments:update'
    ],
    Guest: [
        // Read-only access
        'content:read',
        'library:read',
        'profiles:read',
        'company:read',
        'social:read',
        'version:read',
        'comments:read'
    ]
};


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PLATFORM_CONSTRAINTS = exports.CONTENT_GOALS = exports.DEFAULT_TOPIC_CATEGORIES = void 0;
// Default topic categories
exports.DEFAULT_TOPIC_CATEGORIES = [
    { id: 'product', name: 'Product Updates', description: 'Features, releases, and product announcements', color: '#3B82F6' },
    { id: 'behind-scenes', name: 'Behind the Scenes', description: 'Company culture, team insights, and processes', color: '#8B5CF6' },
    { id: 'thought-leadership', name: 'Thought Leadership', description: 'Industry insights, trends, and expert opinions', color: '#10B981' },
    { id: 'customer-success', name: 'Customer Success', description: 'Case studies, testimonials, and success stories', color: '#F59E0B' },
    { id: 'education', name: 'Educational', description: 'How-to guides, tutorials, and knowledge sharing', color: '#EF4444' },
    { id: 'company-news', name: 'Company News', description: 'Announcements, milestones, and corporate updates', color: '#6B7280' }
];
// Default content goals
exports.CONTENT_GOALS = [
    'brand_awareness',
    'thought_leadership',
    'product_promotion',
    'lead_generation',
    'recruitment',
    'customer_education',
    'industry_insights',
    'company_culture'
];
// Platform-specific constraints
exports.PLATFORM_CONSTRAINTS = {
    twitter: { maxChars: 280, supportsImages: true, supportsVideo: true, maxImages: 4, requiresMedia: false, requiresVideo: false, requiresImage: false },
    linkedin: { maxChars: 3000, supportsImages: true, supportsVideo: true, maxImages: 9, requiresMedia: false, requiresVideo: false, requiresImage: false },
    facebook: { maxChars: 63206, supportsImages: true, supportsVideo: true, maxImages: 10, requiresMedia: false, requiresVideo: false, requiresImage: false },
    instagram: { maxChars: 2200, supportsImages: true, supportsVideo: true, requiresMedia: true, requiresVideo: false, requiresImage: false, maxImages: 10 },
    tiktok: { maxChars: 2200, supportsVideo: true, requiresVideo: true, requiresMedia: false, requiresImage: false, supportsImages: false, maxVideoDuration: 180 },
    youtube: { maxChars: 5000, supportsVideo: true, requiresVideo: true, requiresMedia: false, requiresImage: false, supportsImages: false, maxVideoDuration: 60 }, // For Shorts
    pinterest: { maxChars: 500, supportsImages: true, requiresImage: true, requiresMedia: false, requiresVideo: false, supportsVideo: false },
    threads: { maxChars: 500, supportsImages: true, supportsVideo: true, maxImages: 10, requiresMedia: false, requiresVideo: false, requiresImage: false },
    reddit: { maxChars: 40000, supportsImages: true, supportsVideo: true, requiresMedia: false, requiresVideo: false, requiresImage: false }
};


/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.API_ENDPOINTS = void 0;
exports.API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout',
    },
};


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Company = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
let Company = class Company {
};
exports.Company = Company;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], Company.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", String)
], Company.prototype, "name", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Company.prototype, "logo", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        transformer: {
            to: (value) => JSON.stringify(value),
            from: (value) => JSON.parse(value),
        }
    }),
    tslib_1.__metadata("design:type", Object)
], Company.prototype, "location", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", String)
], Company.prototype, "industry", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], Company.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Company.prototype, "website", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Company.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Company.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", String)
], Company.prototype, "normalizedName", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Company.prototype, "isManualEntry", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Company.prototype, "createdByUserId", void 0);
exports.Company = Company = tslib_1.__decorate([
    (0, typeorm_1.Entity)('companies')
], Company);


/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const auth_service_1 = __webpack_require__(11);
const auth_dto_1 = __webpack_require__(26);
const jwt_auth_guard_1 = __webpack_require__(28);
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    getProfile(req) {
        return req.user;
    }
    async logout() {
        // For JWT, logout is typically handled on the client side
        // by removing the token from storage
        return { message: 'Logged out successfully' };
    }
};
exports.AuthController = AuthController;
tslib_1.__decorate([
    (0, common_1.Post)('login'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof auth_dto_1.LoginDto !== "undefined" && auth_dto_1.LoginDto) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], AuthController.prototype, "login", null);
tslib_1.__decorate([
    (0, common_1.Post)('register'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_d = typeof auth_dto_1.RegisterDto !== "undefined" && auth_dto_1.RegisterDto) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], AuthController.prototype, "register", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('logout'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = tslib_1.__decorate([
    (0, common_1.Controller)('auth'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);


/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthResponseDto = exports.RegisterDto = exports.LoginDto = void 0;
const tslib_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(27);
class LoginDto {
}
exports.LoginDto = LoginDto;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    tslib_1.__metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], LoginDto.prototype, "provider", void 0);
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    tslib_1.__metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    tslib_1.__metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
class AuthResponseDto {
}
exports.AuthResponseDto = AuthResponseDto;


/***/ }),
/* 27 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(9);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = tslib_1.__decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const tslib_1 = __webpack_require__(4);
const passport_jwt_1 = __webpack_require__(30);
const passport_1 = __webpack_require__(9);
const common_1 = __webpack_require__(1);
const auth_service_1 = __webpack_require__(11);
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(authService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
        });
        this.authService = authService;
    }
    async validate(payload) {
        const user = await this.authService.validateUserById(payload.sub);
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        return user;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], JwtStrategy);


/***/ }),
/* 30 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalStrategy = void 0;
const tslib_1 = __webpack_require__(4);
const passport_local_1 = __webpack_require__(32);
const passport_1 = __webpack_require__(9);
const common_1 = __webpack_require__(1);
const auth_service_1 = __webpack_require__(11);
let LocalStrategy = class LocalStrategy extends (0, passport_1.PassportStrategy)(passport_local_1.Strategy) {
    constructor(authService) {
        super({
            usernameField: 'email',
        });
        this.authService = authService;
    }
    async validate(email, password) {
        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        return user;
    }
};
exports.LocalStrategy = LocalStrategy;
exports.LocalStrategy = LocalStrategy = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], LocalStrategy);


/***/ }),
/* 32 */
/***/ ((module) => {

module.exports = require("passport-local");

/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const user_entity_1 = __webpack_require__(14);
const company_entity_1 = __webpack_require__(24);
const writer_profile_entity_1 = __webpack_require__(34);
const company_context_entity_1 = __webpack_require__(35);
const content_topic_entity_1 = __webpack_require__(36);
const content_plan_entity_1 = __webpack_require__(37);
const blog_post_entity_1 = __webpack_require__(38);
const blog_post_section_entity_1 = __webpack_require__(39);
const social_media_post_entity_1 = __webpack_require__(40);
const social_media_content_plan_entity_1 = __webpack_require__(41);
const content_asset_entity_1 = __webpack_require__(42);
const content_tag_entity_1 = __webpack_require__(44);
const reusable_snippet_entity_1 = __webpack_require__(45);
const media_asset_entity_1 = __webpack_require__(46);
const asset_usage_entity_1 = __webpack_require__(43);
const content_version_entity_1 = __webpack_require__(47);
const content_revision_entity_1 = __webpack_require__(48);
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: process.env.NODE_ENV === 'test' ? ':memory:' : 'data.sqlite',
                entities: [user_entity_1.User, company_entity_1.Company, writer_profile_entity_1.WriterProfile, company_context_entity_1.CompanyContext, content_topic_entity_1.ContentTopicEntity, content_plan_entity_1.ContentPlanEntity, blog_post_entity_1.BlogPost, blog_post_section_entity_1.BlogPostSection, social_media_post_entity_1.SocialMediaPost, social_media_content_plan_entity_1.SocialMediaContentPlan, content_asset_entity_1.ContentAsset, content_tag_entity_1.ContentTag, reusable_snippet_entity_1.ReusableSnippet, media_asset_entity_1.MediaAsset, asset_usage_entity_1.AssetUsage, content_version_entity_1.ContentVersion, content_revision_entity_1.ContentRevision],
                synchronize: true, // Auto-sync in development
                logging: process.env.NODE_ENV === 'development',
                // PostgreSQL config (commented for now - use when DB is available)
                // type: 'postgres',
                // host: process.env.DB_HOST || 'localhost',
                // port: parseInt(process.env.DB_PORT, 10) || 5432,
                // username: process.env.DB_USERNAME || 'postgres',
                // password: process.env.DB_PASSWORD || 'password',
                // database: process.env.DB_NAME || 'internal_marketing_content',
                // migrations: ['dist/apps/api/src/database/migrations/*.js'],
                // migrationsRun: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, company_entity_1.Company, writer_profile_entity_1.WriterProfile, company_context_entity_1.CompanyContext, content_topic_entity_1.ContentTopicEntity, content_plan_entity_1.ContentPlanEntity, blog_post_entity_1.BlogPost, blog_post_section_entity_1.BlogPostSection, social_media_post_entity_1.SocialMediaPost, social_media_content_plan_entity_1.SocialMediaContentPlan, content_asset_entity_1.ContentAsset, content_tag_entity_1.ContentTag, reusable_snippet_entity_1.ReusableSnippet, media_asset_entity_1.MediaAsset, asset_usage_entity_1.AssetUsage, content_version_entity_1.ContentVersion, content_revision_entity_1.ContentRevision]),
        ],
        exports: [typeorm_1.TypeOrmModule],
    })
], DatabaseModule);


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WriterProfile = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const shared_1 = __webpack_require__(15);
const company_entity_1 = __webpack_require__(24);
const user_entity_1 = __webpack_require__(14);
let WriterProfile = class WriterProfile {
};
exports.WriterProfile = WriterProfile;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], WriterProfile.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36 }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", String)
], WriterProfile.prototype, "companyId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36 }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", String)
], WriterProfile.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    tslib_1.__metadata("design:type", String)
], WriterProfile.prototype, "name", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    tslib_1.__metadata("design:type", String)
], WriterProfile.prototype, "position", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        enum: ['Professional', 'Casual', 'Technical', 'Inspirational', 'Friendly']
    }),
    tslib_1.__metadata("design:type", typeof (_a = typeof shared_1.WriterTone !== "undefined" && shared_1.WriterTone) === "function" ? _a : Object)
], WriterProfile.prototype, "tone", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        enum: ['Informative', 'Persuasive', 'Educational', 'Entertaining', 'Analytical']
    }),
    tslib_1.__metadata("design:type", typeof (_b = typeof shared_1.WriterStyle !== "undefined" && shared_1.WriterStyle) === "function" ? _b : Object)
], WriterProfile.prototype, "style", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    tslib_1.__metadata("design:type", String)
], WriterProfile.prototype, "targetAudience", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        transformer: {
            to: (value) => JSON.stringify(value),
            from: (value) => value ? JSON.parse(value) : [],
        }
    }),
    tslib_1.__metadata("design:type", Array)
], WriterProfile.prototype, "contentFocusAreas", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        transformer: {
            to: (value) => JSON.stringify(value),
            from: (value) => value ? JSON.parse(value) : [],
        }
    }),
    tslib_1.__metadata("design:type", Array)
], WriterProfile.prototype, "socialPlatforms", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        transformer: {
            to: (value) => JSON.stringify(value),
            from: (value) => value ? JSON.parse(value) : [],
        }
    }),
    tslib_1.__metadata("design:type", Array)
], WriterProfile.prototype, "companyFocusTips", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    tslib_1.__metadata("design:type", Boolean)
], WriterProfile.prototype, "isCustom", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    tslib_1.__metadata("design:type", Boolean)
], WriterProfile.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], WriterProfile.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], WriterProfile.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company),
    (0, typeorm_1.JoinColumn)({ name: 'companyId' }),
    tslib_1.__metadata("design:type", typeof (_e = typeof company_entity_1.Company !== "undefined" && company_entity_1.Company) === "function" ? _e : Object)
], WriterProfile.prototype, "company", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    tslib_1.__metadata("design:type", typeof (_f = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _f : Object)
], WriterProfile.prototype, "user", void 0);
exports.WriterProfile = WriterProfile = tslib_1.__decorate([
    (0, typeorm_1.Entity)('writer_profiles')
], WriterProfile);


/***/ }),
/* 35 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompanyContext = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const shared_1 = __webpack_require__(15);
const company_entity_1 = __webpack_require__(24);
let CompanyContext = class CompanyContext {
};
exports.CompanyContext = CompanyContext;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], CompanyContext.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, unique: true }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", String)
], CompanyContext.prototype, "companyId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    tslib_1.__metadata("design:type", String)
], CompanyContext.prototype, "industryVertical", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        enum: ['Startup', 'SMB', 'Enterprise', 'Corporation']
    }),
    tslib_1.__metadata("design:type", typeof (_a = typeof shared_1.CompanySizeIndicator !== "undefined" && shared_1.CompanySizeIndicator) === "function" ? _a : Object)
], CompanyContext.prototype, "companySizeIndicator", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        enum: ['B2B', 'B2C', 'B2B2C']
    }),
    tslib_1.__metadata("design:type", typeof (_b = typeof shared_1.TargetMarket !== "undefined" && shared_1.TargetMarket) === "function" ? _b : Object)
], CompanyContext.prototype, "targetMarket", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        transformer: {
            to: (value) => JSON.stringify(value),
            from: (value) => value ? JSON.parse(value) : [],
        }
    }),
    tslib_1.__metadata("design:type", Array)
], CompanyContext.prototype, "contentThemes", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        transformer: {
            to: (value) => JSON.stringify(value),
            from: (value) => value ? JSON.parse(value) : [],
        }
    }),
    tslib_1.__metadata("design:type", Array)
], CompanyContext.prototype, "keyDifferentiators", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    tslib_1.__metadata("design:type", String)
], CompanyContext.prototype, "competitivePosition", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        transformer: {
            to: (value) => JSON.stringify(value),
            from: (value) => value ? JSON.parse(value) : [],
        }
    }),
    tslib_1.__metadata("design:type", Array)
], CompanyContext.prototype, "brandPersonality", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        transformer: {
            to: (value) => JSON.stringify(value),
            from: (value) => value ? JSON.parse(value) : [],
        }
    }),
    tslib_1.__metadata("design:type", Array)
], CompanyContext.prototype, "generatedInsights", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], CompanyContext.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], CompanyContext.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToOne)(() => company_entity_1.Company),
    (0, typeorm_1.JoinColumn)({ name: 'companyId' }),
    tslib_1.__metadata("design:type", typeof (_e = typeof company_entity_1.Company !== "undefined" && company_entity_1.Company) === "function" ? _e : Object)
], CompanyContext.prototype, "company", void 0);
exports.CompanyContext = CompanyContext = tslib_1.__decorate([
    (0, typeorm_1.Entity)('company_contexts')
], CompanyContext);


/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentTopic = exports.ContentTopicEntity = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const shared_1 = __webpack_require__(15);
const user_entity_1 = __webpack_require__(14);
const company_entity_1 = __webpack_require__(24);
const writer_profile_entity_1 = __webpack_require__(34);
const content_plan_entity_1 = __webpack_require__(37);
let ContentTopicEntity = class ContentTopicEntity {
};
exports.ContentTopicEntity = ContentTopicEntity;
exports.ContentTopic = ContentTopicEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], ContentTopicEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    tslib_1.__metadata("design:type", String)
], ContentTopicEntity.prototype, "title", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    tslib_1.__metadata("design:type", String)
], ContentTopicEntity.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof shared_1.TopicCategory !== "undefined" && shared_1.TopicCategory) === "function" ? _a : Object)
], ContentTopicEntity.prototype, "category", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    tslib_1.__metadata("design:type", Array)
], ContentTopicEntity.prototype, "keywords", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'planned_month' }),
    tslib_1.__metadata("design:type", Number)
], ContentTopicEntity.prototype, "plannedMonth", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'planned_year' }),
    tslib_1.__metadata("design:type", Number)
], ContentTopicEntity.prototype, "plannedYear", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, default: 'medium' }),
    tslib_1.__metadata("design:type", String)
], ContentTopicEntity.prototype, "priority", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'planned' }),
    tslib_1.__metadata("design:type", String)
], ContentTopicEntity.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'writer_profile_id', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentTopicEntity.prototype, "writerProfileId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'company_id' }),
    tslib_1.__metadata("design:type", String)
], ContentTopicEntity.prototype, "companyId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'user_id' }),
    tslib_1.__metadata("design:type", String)
], ContentTopicEntity.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json', name: 'content_goals' }),
    tslib_1.__metadata("design:type", Array)
], ContentTopicEntity.prototype, "contentGoals", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'content_plan_id', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentTopicEntity.prototype, "contentPlanId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json', name: 'seasonal_events', nullable: true }),
    tslib_1.__metadata("design:type", Array)
], ContentTopicEntity.prototype, "seasonalEvents", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json', name: 'seasonal_relevance', nullable: true }),
    tslib_1.__metadata("design:type", Array)
], ContentTopicEntity.prototype, "seasonalRelevance", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'estimated_read_time', nullable: true }),
    tslib_1.__metadata("design:type", Number)
], ContentTopicEntity.prototype, "estimatedReadTime", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json', name: 'competitor_keywords', nullable: true }),
    tslib_1.__metadata("design:type", Array)
], ContentTopicEntity.prototype, "competitorKeywords", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, name: 'target_audience', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentTopicEntity.prototype, "targetAudience", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json', name: 'seo_keywords', nullable: true }),
    tslib_1.__metadata("design:type", Array)
], ContentTopicEntity.prototype, "seoKeywords", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], ContentTopicEntity.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], ContentTopicEntity.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    tslib_1.__metadata("design:type", typeof (_d = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _d : Object)
], ContentTopicEntity.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    tslib_1.__metadata("design:type", typeof (_e = typeof company_entity_1.Company !== "undefined" && company_entity_1.Company) === "function" ? _e : Object)
], ContentTopicEntity.prototype, "company", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => writer_profile_entity_1.WriterProfile, { eager: false, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'writer_profile_id' }),
    tslib_1.__metadata("design:type", typeof (_f = typeof writer_profile_entity_1.WriterProfile !== "undefined" && writer_profile_entity_1.WriterProfile) === "function" ? _f : Object)
], ContentTopicEntity.prototype, "writerProfile", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => content_plan_entity_1.ContentPlanEntity, plan => plan.topics, { eager: false, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'content_plan_id' }),
    tslib_1.__metadata("design:type", typeof (_g = typeof content_plan_entity_1.ContentPlanEntity !== "undefined" && content_plan_entity_1.ContentPlanEntity) === "function" ? _g : Object)
], ContentTopicEntity.prototype, "contentPlan", void 0);
exports.ContentTopic = exports.ContentTopicEntity = ContentTopicEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('content_topics')
], ContentTopicEntity);


/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentPlan = exports.ContentPlanEntity = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const user_entity_1 = __webpack_require__(14);
const company_entity_1 = __webpack_require__(24);
const content_topic_entity_1 = __webpack_require__(36);
let ContentPlanEntity = class ContentPlanEntity {
};
exports.ContentPlanEntity = ContentPlanEntity;
exports.ContentPlan = ContentPlanEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], ContentPlanEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    tslib_1.__metadata("design:type", String)
], ContentPlanEntity.prototype, "name", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentPlanEntity.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    tslib_1.__metadata("design:type", Number)
], ContentPlanEntity.prototype, "year", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'company_id' }),
    tslib_1.__metadata("design:type", String)
], ContentPlanEntity.prototype, "companyId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'user_id' }),
    tslib_1.__metadata("design:type", String)
], ContentPlanEntity.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    tslib_1.__metadata("design:type", Array)
], ContentPlanEntity.prototype, "goals", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'draft' }),
    tslib_1.__metadata("design:type", String)
], ContentPlanEntity.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], ContentPlanEntity.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], ContentPlanEntity.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    tslib_1.__metadata("design:type", typeof (_c = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _c : Object)
], ContentPlanEntity.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    tslib_1.__metadata("design:type", typeof (_d = typeof company_entity_1.Company !== "undefined" && company_entity_1.Company) === "function" ? _d : Object)
], ContentPlanEntity.prototype, "company", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => content_topic_entity_1.ContentTopicEntity, topic => topic.contentPlan, { eager: false }),
    tslib_1.__metadata("design:type", Array)
], ContentPlanEntity.prototype, "topics", void 0);
exports.ContentPlan = exports.ContentPlanEntity = ContentPlanEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('content_plans')
], ContentPlanEntity);


/***/ }),
/* 38 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BlogPost = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const blog_post_section_entity_1 = __webpack_require__(39);
const content_topic_entity_1 = __webpack_require__(36);
const writer_profile_entity_1 = __webpack_require__(34);
const company_entity_1 = __webpack_require__(24);
const user_entity_1 = __webpack_require__(14);
let BlogPost = class BlogPost {
};
exports.BlogPost = BlogPost;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], BlogPost.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], BlogPost.prototype, "contentTopicId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => content_topic_entity_1.ContentTopic),
    (0, typeorm_1.JoinColumn)({ name: 'contentTopicId' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof content_topic_entity_1.ContentTopic !== "undefined" && content_topic_entity_1.ContentTopic) === "function" ? _a : Object)
], BlogPost.prototype, "contentTopic", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], BlogPost.prototype, "companyId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company),
    (0, typeorm_1.JoinColumn)({ name: 'companyId' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof company_entity_1.Company !== "undefined" && company_entity_1.Company) === "function" ? _b : Object)
], BlogPost.prototype, "company", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], BlogPost.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    tslib_1.__metadata("design:type", typeof (_c = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _c : Object)
], BlogPost.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], BlogPost.prototype, "writerProfileId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => writer_profile_entity_1.WriterProfile, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'writerProfileId' }),
    tslib_1.__metadata("design:type", typeof (_d = typeof writer_profile_entity_1.WriterProfile !== "undefined" && writer_profile_entity_1.WriterProfile) === "function" ? _d : Object)
], BlogPost.prototype, "writerProfile", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], BlogPost.prototype, "title", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], BlogPost.prototype, "subtitle", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('text'),
    tslib_1.__metadata("design:type", String)
], BlogPost.prototype, "excerpt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => blog_post_section_entity_1.BlogPostSection, section => section.blogPost, { cascade: true, eager: true }),
    tslib_1.__metadata("design:type", Array)
], BlogPost.prototype, "sections", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('text'),
    tslib_1.__metadata("design:type", String)
], BlogPost.prototype, "fullContent", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        default: 'draft'
    }),
    tslib_1.__metadata("design:type", String)
], BlogPost.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Number)
], BlogPost.prototype, "wordCount", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Number)
], BlogPost.prototype, "targetWordCount", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Number)
], BlogPost.prototype, "estimatedReadTime", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('json'),
    tslib_1.__metadata("design:type", Object)
], BlogPost.prototype, "seoMetadata", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    tslib_1.__metadata("design:type", Array)
], BlogPost.prototype, "tags", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], BlogPost.prototype, "publishedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_f = typeof Date !== "undefined" && Date) === "function" ? _f : Object)
], BlogPost.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_g = typeof Date !== "undefined" && Date) === "function" ? _g : Object)
], BlogPost.prototype, "updatedAt", void 0);
exports.BlogPost = BlogPost = tslib_1.__decorate([
    (0, typeorm_1.Entity)('blog_posts')
], BlogPost);


/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BlogPostSection = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const blog_post_entity_1 = __webpack_require__(38);
let BlogPostSection = class BlogPostSection {
};
exports.BlogPostSection = BlogPostSection;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], BlogPostSection.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], BlogPostSection.prototype, "blogPostId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => blog_post_entity_1.BlogPost, blogPost => blogPost.sections, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'blogPostId' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof blog_post_entity_1.BlogPost !== "undefined" && blog_post_entity_1.BlogPost) === "function" ? _a : Object)
], BlogPostSection.prototype, "blogPost", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], BlogPostSection.prototype, "title", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('text'),
    tslib_1.__metadata("design:type", String)
], BlogPostSection.prototype, "content", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], BlogPostSection.prototype, "purpose", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Number)
], BlogPostSection.prototype, "order", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        default: 'pending'
    }),
    tslib_1.__metadata("design:type", String)
], BlogPostSection.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", Number)
], BlogPostSection.prototype, "wordCount", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    tslib_1.__metadata("design:type", Array)
], BlogPostSection.prototype, "suggestions", void 0);
exports.BlogPostSection = BlogPostSection = tslib_1.__decorate([
    (0, typeorm_1.Entity)('blog_post_sections')
], BlogPostSection);


/***/ }),
/* 40 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SocialMediaPost = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const blog_post_entity_1 = __webpack_require__(38);
const writer_profile_entity_1 = __webpack_require__(34);
const social_media_content_plan_entity_1 = __webpack_require__(41);
const shared_1 = __webpack_require__(15);
let SocialMediaPost = class SocialMediaPost {
};
exports.SocialMediaPost = SocialMediaPost;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], SocialMediaPost.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], SocialMediaPost.prototype, "blogPostId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => blog_post_entity_1.BlogPost),
    (0, typeorm_1.JoinColumn)({ name: 'blogPostId' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof blog_post_entity_1.BlogPost !== "undefined" && blog_post_entity_1.BlogPost) === "function" ? _a : Object)
], SocialMediaPost.prototype, "blogPost", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], SocialMediaPost.prototype, "contentPlanId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => social_media_content_plan_entity_1.SocialMediaContentPlan, plan => plan.posts),
    (0, typeorm_1.JoinColumn)({ name: 'contentPlanId' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof social_media_content_plan_entity_1.SocialMediaContentPlan !== "undefined" && social_media_content_plan_entity_1.SocialMediaContentPlan) === "function" ? _b : Object)
], SocialMediaPost.prototype, "contentPlan", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    tslib_1.__metadata("design:type", typeof (_c = typeof shared_1.SocialMediaPlatform !== "undefined" && shared_1.SocialMediaPlatform) === "function" ? _c : Object)
], SocialMediaPost.prototype, "platform", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], SocialMediaPost.prototype, "writerProfileId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => writer_profile_entity_1.WriterProfile),
    (0, typeorm_1.JoinColumn)({ name: 'writerProfileId' }),
    tslib_1.__metadata("design:type", typeof (_d = typeof writer_profile_entity_1.WriterProfile !== "undefined" && writer_profile_entity_1.WriterProfile) === "function" ? _d : Object)
], SocialMediaPost.prototype, "writerProfile", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('text'),
    tslib_1.__metadata("design:type", String)
], SocialMediaPost.prototype, "content", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('simple-array'),
    tslib_1.__metadata("design:type", Array)
], SocialMediaPost.prototype, "hashtags", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('simple-array'),
    tslib_1.__metadata("design:type", Array)
], SocialMediaPost.prototype, "emojis", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], SocialMediaPost.prototype, "callToAction", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Number)
], SocialMediaPost.prototype, "characterCount", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'text' }),
    tslib_1.__metadata("design:type", String)
], SocialMediaPost.prototype, "mediaType", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    tslib_1.__metadata("design:type", Array)
], SocialMediaPost.prototype, "visualConcepts", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    tslib_1.__metadata("design:type", String)
], SocialMediaPost.prototype, "angle", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'draft' }),
    tslib_1.__metadata("design:type", String)
], SocialMediaPost.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], SocialMediaPost.prototype, "scheduledFor", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", typeof (_f = typeof Date !== "undefined" && Date) === "function" ? _f : Object)
], SocialMediaPost.prototype, "publishedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_g = typeof Date !== "undefined" && Date) === "function" ? _g : Object)
], SocialMediaPost.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_h = typeof Date !== "undefined" && Date) === "function" ? _h : Object)
], SocialMediaPost.prototype, "updatedAt", void 0);
exports.SocialMediaPost = SocialMediaPost = tslib_1.__decorate([
    (0, typeorm_1.Entity)('social_media_posts')
], SocialMediaPost);


/***/ }),
/* 41 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SocialMediaContentPlan = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const blog_post_entity_1 = __webpack_require__(38);
const company_entity_1 = __webpack_require__(24);
const user_entity_1 = __webpack_require__(14);
const social_media_post_entity_1 = __webpack_require__(40);
let SocialMediaContentPlan = class SocialMediaContentPlan {
};
exports.SocialMediaContentPlan = SocialMediaContentPlan;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], SocialMediaContentPlan.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], SocialMediaContentPlan.prototype, "blogPostId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => blog_post_entity_1.BlogPost),
    (0, typeorm_1.JoinColumn)({ name: 'blogPostId' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof blog_post_entity_1.BlogPost !== "undefined" && blog_post_entity_1.BlogPost) === "function" ? _a : Object)
], SocialMediaContentPlan.prototype, "blogPost", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], SocialMediaContentPlan.prototype, "companyId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company),
    (0, typeorm_1.JoinColumn)({ name: 'companyId' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof company_entity_1.Company !== "undefined" && company_entity_1.Company) === "function" ? _b : Object)
], SocialMediaContentPlan.prototype, "company", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], SocialMediaContentPlan.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    tslib_1.__metadata("design:type", typeof (_c = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _c : Object)
], SocialMediaContentPlan.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => social_media_post_entity_1.SocialMediaPost, post => post.contentPlan, { cascade: true, eager: true }),
    tslib_1.__metadata("design:type", Array)
], SocialMediaContentPlan.prototype, "posts", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('simple-array'),
    tslib_1.__metadata("design:type", Array)
], SocialMediaContentPlan.prototype, "selectedPlatforms", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('simple-array'),
    tslib_1.__metadata("design:type", Array)
], SocialMediaContentPlan.prototype, "selectedWriterProfiles", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'weekly' }),
    tslib_1.__metadata("design:type", String)
], SocialMediaContentPlan.prototype, "publishingFrequency", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'draft' }),
    tslib_1.__metadata("design:type", String)
], SocialMediaContentPlan.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], SocialMediaContentPlan.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], SocialMediaContentPlan.prototype, "updatedAt", void 0);
exports.SocialMediaContentPlan = SocialMediaContentPlan = tslib_1.__decorate([
    (0, typeorm_1.Entity)('social_media_content_plans')
], SocialMediaContentPlan);


/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentAsset = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const user_entity_1 = __webpack_require__(14);
const company_entity_1 = __webpack_require__(24);
const asset_usage_entity_1 = __webpack_require__(43);
let ContentAsset = class ContentAsset {
};
exports.ContentAsset = ContentAsset;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], ContentAsset.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    tslib_1.__metadata("design:type", String)
], ContentAsset.prototype, "title", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentAsset.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    tslib_1.__metadata("design:type", String)
], ContentAsset.prototype, "type", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'draft' }),
    tslib_1.__metadata("design:type", String)
], ContentAsset.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'blog_post_id', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentAsset.prototype, "blogPostId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'social_post_id', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentAsset.prototype, "socialPostId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'content_snippet_id', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentAsset.prototype, "contentSnippetId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'media_asset_id', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentAsset.prototype, "mediaAssetId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json', default: '[]' }),
    tslib_1.__metadata("design:type", Array)
], ContentAsset.prototype, "tags", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentAsset.prototype, "category", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'company_id' }),
    tslib_1.__metadata("design:type", String)
], ContentAsset.prototype, "companyId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'user_id' }),
    tslib_1.__metadata("design:type", String)
], ContentAsset.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], ContentAsset.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], ContentAsset.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'times_used', default: 0 }),
    tslib_1.__metadata("design:type", Number)
], ContentAsset.prototype, "timesUsed", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', name: 'last_used', nullable: true }),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], ContentAsset.prototype, "lastUsed", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, name: 'file_name', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentAsset.prototype, "fileName", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', name: 'file_size', nullable: true }),
    tslib_1.__metadata("design:type", Number)
], ContentAsset.prototype, "fileSize", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, name: 'mime_type', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentAsset.prototype, "mimeType", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentAsset.prototype, "url", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'thumbnail_url', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentAsset.prototype, "thumbnailUrl", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    tslib_1.__metadata("design:type", typeof (_d = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _d : Object)
], ContentAsset.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    tslib_1.__metadata("design:type", typeof (_e = typeof company_entity_1.Company !== "undefined" && company_entity_1.Company) === "function" ? _e : Object)
], ContentAsset.prototype, "company", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => asset_usage_entity_1.AssetUsage, usage => usage.asset, { eager: false }),
    tslib_1.__metadata("design:type", Array)
], ContentAsset.prototype, "usageHistory", void 0);
exports.ContentAsset = ContentAsset = tslib_1.__decorate([
    (0, typeorm_1.Entity)('content_assets')
], ContentAsset);


/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AssetUsage = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const content_asset_entity_1 = __webpack_require__(42);
const user_entity_1 = __webpack_require__(14);
let AssetUsage = class AssetUsage {
};
exports.AssetUsage = AssetUsage;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], AssetUsage.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'asset_id' }),
    tslib_1.__metadata("design:type", String)
], AssetUsage.prototype, "assetId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, name: 'used_in_type' }),
    tslib_1.__metadata("design:type", String)
], AssetUsage.prototype, "usedInType", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, name: 'used_in_id' }),
    tslib_1.__metadata("design:type", String)
], AssetUsage.prototype, "usedInId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'used_at' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], AssetUsage.prototype, "usedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'used_by' }),
    tslib_1.__metadata("design:type", String)
], AssetUsage.prototype, "usedBy", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    tslib_1.__metadata("design:type", String)
], AssetUsage.prototype, "platform", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => content_asset_entity_1.ContentAsset, asset => asset.usageHistory, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'asset_id' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof content_asset_entity_1.ContentAsset !== "undefined" && content_asset_entity_1.ContentAsset) === "function" ? _b : Object)
], AssetUsage.prototype, "asset", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'used_by' }),
    tslib_1.__metadata("design:type", typeof (_c = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _c : Object)
], AssetUsage.prototype, "user", void 0);
exports.AssetUsage = AssetUsage = tslib_1.__decorate([
    (0, typeorm_1.Entity)('asset_usage')
], AssetUsage);


/***/ }),
/* 44 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentTag = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
let ContentTag = class ContentTag {
};
exports.ContentTag = ContentTag;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], ContentTag.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    tslib_1.__metadata("design:type", String)
], ContentTag.prototype, "name", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    tslib_1.__metadata("design:type", String)
], ContentTag.prototype, "type", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 7, nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentTag.prototype, "color", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentTag.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'company_id' }),
    tslib_1.__metadata("design:type", String)
], ContentTag.prototype, "companyId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'user_id' }),
    tslib_1.__metadata("design:type", String)
], ContentTag.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], ContentTag.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], ContentTag.prototype, "updatedAt", void 0);
exports.ContentTag = ContentTag = tslib_1.__decorate([
    (0, typeorm_1.Entity)('content_tags')
], ContentTag);


/***/ }),
/* 45 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReusableSnippet = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const user_entity_1 = __webpack_require__(14);
const company_entity_1 = __webpack_require__(24);
let ReusableSnippet = class ReusableSnippet {
};
exports.ReusableSnippet = ReusableSnippet;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], ReusableSnippet.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    tslib_1.__metadata("design:type", String)
], ReusableSnippet.prototype, "title", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    tslib_1.__metadata("design:type", String)
], ReusableSnippet.prototype, "content", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    tslib_1.__metadata("design:type", String)
], ReusableSnippet.prototype, "type", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json', default: '[]' }),
    tslib_1.__metadata("design:type", Array)
], ReusableSnippet.prototype, "tags", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'company_id' }),
    tslib_1.__metadata("design:type", String)
], ReusableSnippet.prototype, "companyId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'user_id' }),
    tslib_1.__metadata("design:type", String)
], ReusableSnippet.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], ReusableSnippet.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], ReusableSnippet.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'times_used', default: 0 }),
    tslib_1.__metadata("design:type", Number)
], ReusableSnippet.prototype, "timesUsed", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', name: 'last_used', nullable: true }),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], ReusableSnippet.prototype, "lastUsed", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    tslib_1.__metadata("design:type", typeof (_d = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _d : Object)
], ReusableSnippet.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    tslib_1.__metadata("design:type", typeof (_e = typeof company_entity_1.Company !== "undefined" && company_entity_1.Company) === "function" ? _e : Object)
], ReusableSnippet.prototype, "company", void 0);
exports.ReusableSnippet = ReusableSnippet = tslib_1.__decorate([
    (0, typeorm_1.Entity)('reusable_snippets')
], ReusableSnippet);


/***/ }),
/* 46 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MediaAsset = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const user_entity_1 = __webpack_require__(14);
const company_entity_1 = __webpack_require__(24);
const asset_usage_entity_1 = __webpack_require__(43);
let MediaAsset = class MediaAsset {
};
exports.MediaAsset = MediaAsset;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], MediaAsset.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    tslib_1.__metadata("design:type", String)
], MediaAsset.prototype, "title", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], MediaAsset.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, name: 'file_name' }),
    tslib_1.__metadata("design:type", String)
], MediaAsset.prototype, "fileName", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, name: 'original_file_name' }),
    tslib_1.__metadata("design:type", String)
], MediaAsset.prototype, "originalFileName", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', name: 'file_size' }),
    tslib_1.__metadata("design:type", Number)
], MediaAsset.prototype, "fileSize", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, name: 'mime_type' }),
    tslib_1.__metadata("design:type", String)
], MediaAsset.prototype, "mimeType", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    tslib_1.__metadata("design:type", String)
], MediaAsset.prototype, "url", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'thumbnail_url', nullable: true }),
    tslib_1.__metadata("design:type", String)
], MediaAsset.prototype, "thumbnailUrl", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    tslib_1.__metadata("design:type", Number)
], MediaAsset.prototype, "width", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    tslib_1.__metadata("design:type", Number)
], MediaAsset.prototype, "height", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    tslib_1.__metadata("design:type", Number)
], MediaAsset.prototype, "duration", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json', default: '[]' }),
    tslib_1.__metadata("design:type", Array)
], MediaAsset.prototype, "tags", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    tslib_1.__metadata("design:type", String)
], MediaAsset.prototype, "category", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'company_id' }),
    tslib_1.__metadata("design:type", String)
], MediaAsset.prototype, "companyId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'user_id' }),
    tslib_1.__metadata("design:type", String)
], MediaAsset.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'uploaded_at' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], MediaAsset.prototype, "uploadedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], MediaAsset.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'times_used', default: 0 }),
    tslib_1.__metadata("design:type", Number)
], MediaAsset.prototype, "timesUsed", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', name: 'last_used', nullable: true }),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], MediaAsset.prototype, "lastUsed", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    tslib_1.__metadata("design:type", typeof (_d = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _d : Object)
], MediaAsset.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    tslib_1.__metadata("design:type", typeof (_e = typeof company_entity_1.Company !== "undefined" && company_entity_1.Company) === "function" ? _e : Object)
], MediaAsset.prototype, "company", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => asset_usage_entity_1.AssetUsage, usage => usage.asset, { eager: false }),
    tslib_1.__metadata("design:type", Array)
], MediaAsset.prototype, "usageHistory", void 0);
exports.MediaAsset = MediaAsset = tslib_1.__decorate([
    (0, typeorm_1.Entity)('media_assets')
], MediaAsset);


/***/ }),
/* 47 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentVersion = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const user_entity_1 = __webpack_require__(14);
const shared_1 = __webpack_require__(15);
let ContentVersion = class ContentVersion {
};
exports.ContentVersion = ContentVersion;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], ContentVersion.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50
    }),
    tslib_1.__metadata("design:type", typeof (_a = typeof shared_1.ContentEntityType !== "undefined" && shared_1.ContentEntityType) === "function" ? _a : Object)
], ContentVersion.prototype, "entityType", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('uuid'),
    tslib_1.__metadata("design:type", String)
], ContentVersion.prototype, "entityId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('int'),
    tslib_1.__metadata("design:type", Number)
], ContentVersion.prototype, "versionNumber", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50
    }),
    tslib_1.__metadata("design:type", typeof (_b = typeof shared_1.ChangeType !== "undefined" && shared_1.ChangeType) === "function" ? _b : Object)
], ContentVersion.prototype, "changeType", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50
    }),
    tslib_1.__metadata("design:type", typeof (_c = typeof shared_1.ChangeSource !== "undefined" && shared_1.ChangeSource) === "function" ? _c : Object)
], ContentVersion.prototype, "changeSource", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('uuid'),
    tslib_1.__metadata("design:type", String)
], ContentVersion.prototype, "changedBy", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'changedBy' }),
    tslib_1.__metadata("design:type", typeof (_d = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _d : Object)
], ContentVersion.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], ContentVersion.prototype, "changedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentVersion.prototype, "changeDescription", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    tslib_1.__metadata("design:type", Object)
], ContentVersion.prototype, "contentSnapshot", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    tslib_1.__metadata("design:type", Object)
], ContentVersion.prototype, "contentDiff", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentVersion.prototype, "previousVersionId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentVersion.prototype, "nextVersionId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    tslib_1.__metadata("design:type", Array)
], ContentVersion.prototype, "tags", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    tslib_1.__metadata("design:type", typeof (_f = typeof Record !== "undefined" && Record) === "function" ? _f : Object)
], ContentVersion.prototype, "metadata", void 0);
exports.ContentVersion = ContentVersion = tslib_1.__decorate([
    (0, typeorm_1.Entity)('content_versions'),
    (0, typeorm_1.Index)(['entityType', 'entityId', 'versionNumber']),
    (0, typeorm_1.Index)(['entityType', 'entityId', 'changedAt']),
    (0, typeorm_1.Index)(['changedBy', 'changedAt'])
], ContentVersion);


/***/ }),
/* 48 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentRevision = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const user_entity_1 = __webpack_require__(14);
const blog_post_entity_1 = __webpack_require__(38);
const blog_post_section_entity_1 = __webpack_require__(39);
const social_media_post_entity_1 = __webpack_require__(40);
const reusable_snippet_entity_1 = __webpack_require__(45);
const shared_1 = __webpack_require__(15);
let ContentRevision = class ContentRevision {
};
exports.ContentRevision = ContentRevision;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], ContentRevision.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentRevision.prototype, "blogPostId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => blog_post_entity_1.BlogPost, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'blogPostId' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof blog_post_entity_1.BlogPost !== "undefined" && blog_post_entity_1.BlogPost) === "function" ? _a : Object)
], ContentRevision.prototype, "blogPost", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentRevision.prototype, "socialPostId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => social_media_post_entity_1.SocialMediaPost, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'socialPostId' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof social_media_post_entity_1.SocialMediaPost !== "undefined" && social_media_post_entity_1.SocialMediaPost) === "function" ? _b : Object)
], ContentRevision.prototype, "socialPost", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentRevision.prototype, "snippetId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => reusable_snippet_entity_1.ReusableSnippet, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'snippetId' }),
    tslib_1.__metadata("design:type", typeof (_c = typeof reusable_snippet_entity_1.ReusableSnippet !== "undefined" && reusable_snippet_entity_1.ReusableSnippet) === "function" ? _c : Object)
], ContentRevision.prototype, "snippet", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentRevision.prototype, "sectionId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => blog_post_section_entity_1.BlogPostSection, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'sectionId' }),
    tslib_1.__metadata("design:type", typeof (_d = typeof blog_post_section_entity_1.BlogPostSection !== "undefined" && blog_post_section_entity_1.BlogPostSection) === "function" ? _d : Object)
], ContentRevision.prototype, "section", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    tslib_1.__metadata("design:type", Number)
], ContentRevision.prototype, "paragraphIndex", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('int'),
    tslib_1.__metadata("design:type", Number)
], ContentRevision.prototype, "fromVersion", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('int'),
    tslib_1.__metadata("design:type", Number)
], ContentRevision.prototype, "toVersion", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50
    }),
    tslib_1.__metadata("design:type", typeof (_e = typeof shared_1.ChangeType !== "undefined" && shared_1.ChangeType) === "function" ? _e : Object)
], ContentRevision.prototype, "changeType", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50
    }),
    tslib_1.__metadata("design:type", typeof (_f = typeof shared_1.ChangeSource !== "undefined" && shared_1.ChangeSource) === "function" ? _f : Object)
], ContentRevision.prototype, "changeSource", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('uuid'),
    tslib_1.__metadata("design:type", String)
], ContentRevision.prototype, "changedBy", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'changedBy' }),
    tslib_1.__metadata("design:type", typeof (_g = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _g : Object)
], ContentRevision.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_h = typeof Date !== "undefined" && Date) === "function" ? _h : Object)
], ContentRevision.prototype, "changedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    tslib_1.__metadata("design:type", String)
], ContentRevision.prototype, "previousContent", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    tslib_1.__metadata("design:type", String)
], ContentRevision.prototype, "newContent", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    tslib_1.__metadata("design:type", Object)
], ContentRevision.prototype, "contentDiff", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentRevision.prototype, "changeNotes", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentRevision.prototype, "aiPrompt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    tslib_1.__metadata("design:type", String)
], ContentRevision.prototype, "aiModel", void 0);
exports.ContentRevision = ContentRevision = tslib_1.__decorate([
    (0, typeorm_1.Entity)('content_revisions'),
    (0, typeorm_1.Index)(['blogPostId', 'changedAt']),
    (0, typeorm_1.Index)(['socialPostId', 'changedAt']),
    (0, typeorm_1.Index)(['snippetId', 'changedAt']),
    (0, typeorm_1.Index)(['changedBy', 'changedAt'])
], ContentRevision);


/***/ }),
/* 49 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompaniesModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const companies_controller_1 = __webpack_require__(50);
const companies_service_1 = __webpack_require__(51);
const company_entity_1 = __webpack_require__(24);
let CompaniesModule = class CompaniesModule {
};
exports.CompaniesModule = CompaniesModule;
exports.CompaniesModule = CompaniesModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([company_entity_1.Company])],
        controllers: [companies_controller_1.CompaniesController],
        providers: [companies_service_1.CompaniesService],
        exports: [companies_service_1.CompaniesService],
    })
], CompaniesModule);


/***/ }),
/* 50 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompaniesController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const companies_service_1 = __webpack_require__(51);
const jwt_auth_guard_1 = __webpack_require__(28);
const company_dto_1 = __webpack_require__(52);
let CompaniesController = class CompaniesController {
    constructor(companiesService) {
        this.companiesService = companiesService;
    }
    async searchCompanies(searchDto) {
        return this.companiesService.searchCompanies(searchDto);
    }
    async getCompany(id) {
        const company = await this.companiesService.getCompanyById(id);
        return company;
    }
    async createCompany(createCompanyDto, req) {
        const userId = req.user?.id;
        const company = await this.companiesService.createCompany(createCompanyDto, userId);
        return company;
    }
    async seedMockData() {
        await this.companiesService.seedMockData();
        return { message: 'Mock data seeded successfully' };
    }
};
exports.CompaniesController = CompaniesController;
tslib_1.__decorate([
    (0, common_1.Get)('search'),
    tslib_1.__param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof company_dto_1.SearchCompaniesDto !== "undefined" && company_dto_1.SearchCompaniesDto) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], CompaniesController.prototype, "searchCompanies", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], CompaniesController.prototype, "getCompany", null);
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_e = typeof company_dto_1.CreateCompanyDto !== "undefined" && company_dto_1.CreateCompanyDto) === "function" ? _e : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], CompaniesController.prototype, "createCompany", null);
tslib_1.__decorate([
    (0, common_1.Post)('seed'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], CompaniesController.prototype, "seedMockData", null);
exports.CompaniesController = CompaniesController = tslib_1.__decorate([
    (0, common_1.Controller)('companies'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof companies_service_1.CompaniesService !== "undefined" && companies_service_1.CompaniesService) === "function" ? _a : Object])
], CompaniesController);


/***/ }),
/* 51 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompaniesService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(12);
const company_entity_1 = __webpack_require__(24);
let CompaniesService = class CompaniesService {
    constructor(companyRepository) {
        this.companyRepository = companyRepository;
    }
    normalizeSearchQuery(query) {
        return query.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    }
    calculateConfidence(company, searchQuery) {
        const normalizedQuery = this.normalizeSearchQuery(searchQuery);
        const normalizedName = this.normalizeSearchQuery(company.name);
        // Exact match
        if (normalizedName === normalizedQuery)
            return 100;
        // Starts with query
        if (normalizedName.startsWith(normalizedQuery))
            return 90;
        // Contains query
        if (normalizedName.includes(normalizedQuery))
            return 70;
        // Fuzzy match (simple implementation)
        const queryWords = normalizedQuery.split(' ');
        const nameWords = normalizedName.split(' ');
        const matchedWords = queryWords.filter(qw => nameWords.some(nw => nw.includes(qw) || qw.includes(nw)));
        return Math.round((matchedWords.length / queryWords.length) * 60);
    }
    async searchCompanies(searchDto) {
        const { query, limit = 10, offset = 0, industry, country } = searchDto;
        // Build query
        let queryBuilder = this.companyRepository.createQueryBuilder('company');
        // Search by name (case-insensitive partial match)
        queryBuilder.where('LOWER(company.name) LIKE :query', {
            query: `%${query.toLowerCase()}%`
        });
        // Filter by industry if provided
        if (industry) {
            queryBuilder.andWhere('LOWER(company.industry) = :industry', {
                industry: industry.toLowerCase()
            });
        }
        // Filter by country if provided
        if (country) {
            queryBuilder.andWhere("json_extract(company.location, '$.country') = :country", {
                country
            });
        }
        // Get total count
        const totalCount = await queryBuilder.getCount();
        // Apply pagination
        queryBuilder.skip(offset).take(limit);
        // Execute query
        const companies = await queryBuilder.getMany();
        // Calculate confidence scores and sort
        const companiesWithConfidence = companies
            .map(company => ({
            ...company,
            confidence: this.calculateConfidence(company, query)
        }))
            .sort((a, b) => b.confidence - a.confidence);
        return {
            companies: companiesWithConfidence,
            totalCount,
            searchQuery: query
        };
    }
    async getCompanyById(id) {
        const company = await this.companyRepository.findOne({ where: { id } });
        if (!company) {
            throw new common_1.NotFoundException(`Company with ID ${id} not found`);
        }
        return company;
    }
    async createCompany(createCompanyDto, userId) {
        const normalizedName = this.normalizeSearchQuery(createCompanyDto.name);
        const company = this.companyRepository.create({
            ...createCompanyDto,
            normalizedName,
            isManualEntry: true,
            createdByUserId: userId
        });
        return this.companyRepository.save(company);
    }
    async seedMockData() {
        const mockCompanies = [
            {
                name: 'Acme Corporation',
                industry: 'Technology',
                location: { city: 'San Francisco', country: 'USA' },
                description: 'Leading technology solutions provider',
                website: 'https://acme.example.com',
                normalizedName: 'acme corporation'
            },
            {
                name: 'Global Industries Inc',
                industry: 'Manufacturing',
                location: { city: 'New York', country: 'USA' },
                description: 'Multinational manufacturing company',
                website: 'https://globalindustries.example.com',
                normalizedName: 'global industries inc'
            },
            {
                name: 'TechStart Solutions',
                industry: 'Technology',
                location: { city: 'Austin', country: 'USA' },
                description: 'Innovative startup focused on AI solutions',
                website: 'https://techstart.example.com',
                normalizedName: 'techstart solutions'
            },
            {
                name: 'European Consulting Group',
                industry: 'Consulting',
                location: { city: 'London', country: 'UK' },
                description: 'Strategic business consulting services',
                website: 'https://ecg.example.com',
                normalizedName: 'european consulting group'
            },
            {
                name: 'Pacific Retail Co',
                industry: 'Retail',
                location: { city: 'Sydney', country: 'Australia' },
                description: 'Retail chain across Pacific region',
                website: 'https://pacificretail.example.com',
                normalizedName: 'pacific retail co'
            }
        ];
        // Check if we already have companies
        const count = await this.companyRepository.count();
        if (count === 0) {
            // Seed mock data
            await this.companyRepository.save(mockCompanies);
        }
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], CompaniesService);


/***/ }),
/* 52 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompanySearchResponseDto = exports.CompanyResponseDto = exports.CreateCompanyDto = exports.SearchCompaniesDto = void 0;
const tslib_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(27);
const class_transformer_1 = __webpack_require__(53);
class LocationDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], LocationDto.prototype, "city", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], LocationDto.prototype, "country", void 0);
class SearchCompaniesDto {
    constructor() {
        this.limit = 10;
        this.offset = 0;
    }
}
exports.SearchCompaniesDto = SearchCompaniesDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], SearchCompaniesDto.prototype, "query", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    tslib_1.__metadata("design:type", Number)
], SearchCompaniesDto.prototype, "limit", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], SearchCompaniesDto.prototype, "offset", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], SearchCompaniesDto.prototype, "industry", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], SearchCompaniesDto.prototype, "country", void 0);
class CreateCompanyDto {
}
exports.CreateCompanyDto = CreateCompanyDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCompanyDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCompanyDto.prototype, "industry", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LocationDto),
    tslib_1.__metadata("design:type", LocationDto)
], CreateCompanyDto.prototype, "location", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    tslib_1.__metadata("design:type", String)
], CreateCompanyDto.prototype, "website", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCompanyDto.prototype, "description", void 0);
class CompanyResponseDto {
}
exports.CompanyResponseDto = CompanyResponseDto;
class CompanySearchResponseDto {
}
exports.CompanySearchResponseDto = CompanySearchResponseDto;


/***/ }),
/* 53 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 54 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompanyContextModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const company_context_service_1 = __webpack_require__(55);
const company_context_controller_1 = __webpack_require__(56);
const company_context_entity_1 = __webpack_require__(35);
const company_entity_1 = __webpack_require__(24);
let CompanyContextModule = class CompanyContextModule {
};
exports.CompanyContextModule = CompanyContextModule;
exports.CompanyContextModule = CompanyContextModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([company_context_entity_1.CompanyContext, company_entity_1.Company])],
        controllers: [company_context_controller_1.CompanyContextController],
        providers: [company_context_service_1.CompanyContextService],
        exports: [company_context_service_1.CompanyContextService],
    })
], CompanyContextModule);


/***/ }),
/* 55 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompanyContextService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(12);
const company_context_entity_1 = __webpack_require__(35);
const company_entity_1 = __webpack_require__(24);
let CompanyContextService = class CompanyContextService {
    constructor(companyContextRepository, companyRepository) {
        this.companyContextRepository = companyContextRepository;
        this.companyRepository = companyRepository;
    }
    async analyzeCompany(companyId) {
        const company = await this.companyRepository.findOne({
            where: { id: companyId }
        });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        // Check if context already exists
        const existingContext = await this.companyContextRepository.findOne({
            where: { companyId }
        });
        if (existingContext) {
            return existingContext;
        }
        // Generate company context based on company information
        const context = await this.generateCompanyContext(company);
        const newContext = this.companyContextRepository.create({
            companyId,
            ...context
        });
        return await this.companyContextRepository.save(newContext);
    }
    async getByCompanyId(companyId) {
        const context = await this.companyContextRepository.findOne({
            where: { companyId },
            relations: ['company']
        });
        if (!context) {
            throw new common_1.NotFoundException('Company context not found');
        }
        return context;
    }
    async create(createDto) {
        const company = await this.companyRepository.findOne({
            where: { id: createDto.companyId }
        });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        // Check if context already exists
        const existingContext = await this.companyContextRepository.findOne({
            where: { companyId: createDto.companyId }
        });
        if (existingContext) {
            throw new common_1.BadRequestException('Company context already exists');
        }
        const context = this.companyContextRepository.create(createDto);
        return await this.companyContextRepository.save(context);
    }
    async update(companyId, updateDto) {
        const context = await this.getByCompanyId(companyId);
        Object.assign(context, updateDto);
        return await this.companyContextRepository.save(context);
    }
    async delete(companyId) {
        const context = await this.getByCompanyId(companyId);
        await this.companyContextRepository.remove(context);
    }
    async generateCompanyContext(company) {
        // Industry-based analysis
        const industryAnalysis = this.analyzeIndustry(company.industry);
        // Size indicator based on description and industry
        const sizeIndicator = this.determineSizeIndicator(company);
        // Target market analysis
        const targetMarket = this.analyzeTargetMarket(company.industry);
        // Generate content themes based on industry
        const contentThemes = this.generateContentThemes(company.industry);
        // Generate key differentiators
        const keyDifferentiators = this.generateKeyDifferentiators(company.industry);
        // Competitive position
        const competitivePosition = this.generateCompetitivePosition(company.industry, sizeIndicator);
        // Brand personality traits
        const brandPersonality = this.generateBrandPersonality(company.industry, sizeIndicator);
        // Generated insights
        const generatedInsights = this.generateInsights(company, sizeIndicator, targetMarket);
        return {
            industryVertical: company.industry,
            companySizeIndicator: sizeIndicator,
            targetMarket,
            contentThemes,
            keyDifferentiators,
            competitivePosition,
            brandPersonality,
            generatedInsights
        };
    }
    analyzeIndustry(industry) {
        // Normalize industry name
        return industry.charAt(0).toUpperCase() + industry.slice(1).toLowerCase();
    }
    determineSizeIndicator(company) {
        const description = company.description?.toLowerCase() || '';
        const name = company.name.toLowerCase();
        // Basic heuristics for company size
        if (description.includes('startup') || description.includes('new') || description.includes('emerging')) {
            return 'Startup';
        }
        else if (description.includes('enterprise') || description.includes('large') || description.includes('multinational')) {
            return 'Enterprise';
        }
        else if (description.includes('corporation') || description.includes('global') || name.includes('corp')) {
            return 'Corporation';
        }
        else {
            return 'SMB'; // Small/Medium Business as default
        }
    }
    analyzeTargetMarket(industry) {
        const industryLower = industry.toLowerCase();
        // Industry-based target market mapping
        const b2bIndustries = ['software', 'technology', 'consulting', 'financial services', 'manufacturing', 'logistics'];
        const b2cIndustries = ['retail', 'consumer goods', 'entertainment', 'food', 'fashion', 'travel'];
        if (b2bIndustries.some(ind => industryLower.includes(ind))) {
            return 'B2B';
        }
        else if (b2cIndustries.some(ind => industryLower.includes(ind))) {
            return 'B2C';
        }
        else {
            return 'B2B2C'; // Mixed model as default for ambiguous industries
        }
    }
    generateContentThemes(industry) {
        const industryLower = industry.toLowerCase();
        const themeMap = {
            'technology': ['Innovation', 'Digital Transformation', 'Tech Trends', 'Industry Solutions', 'Future of Work'],
            'healthcare': ['Patient Care', 'Medical Innovation', 'Health & Wellness', 'Healthcare Technology', 'Clinical Excellence'],
            'finance': ['Financial Planning', 'Investment Strategies', 'Economic Insights', 'Risk Management', 'Market Analysis'],
            'retail': ['Customer Experience', 'Product Showcases', 'Shopping Trends', 'Brand Stories', 'Seasonal Campaigns'],
            'manufacturing': ['Operational Excellence', 'Supply Chain', 'Quality Control', 'Industrial Innovation', 'Sustainability'],
            'education': ['Learning Methods', 'Educational Technology', 'Student Success', 'Curriculum Development', 'Academic Excellence']
        };
        // Find matching industry or return generic themes
        for (const [key, themes] of Object.entries(themeMap)) {
            if (industryLower.includes(key)) {
                return themes;
            }
        }
        return ['Industry Leadership', 'Customer Success', 'Innovation', 'Company Culture', 'Market Insights'];
    }
    generateKeyDifferentiators(industry) {
        const industryLower = industry.toLowerCase();
        const differentiatorMap = {
            'technology': ['Cutting-edge innovation', 'Scalable solutions', 'Expert technical team', 'Proven track record'],
            'healthcare': ['Patient-focused approach', 'Clinical expertise', 'Advanced medical technology', 'Quality outcomes'],
            'finance': ['Personalized service', 'Risk management expertise', 'Regulatory compliance', 'Transparent communication'],
            'retail': ['Customer-centric experience', 'Quality products', 'Competitive pricing', 'Excellent service'],
            'manufacturing': ['Quality manufacturing', 'Efficient processes', 'Reliable delivery', 'Cost-effective solutions'],
            'education': ['Innovative teaching methods', 'Experienced educators', 'Student-centered approach', 'Academic excellence']
        };
        for (const [key, differentiators] of Object.entries(differentiatorMap)) {
            if (industryLower.includes(key)) {
                return differentiators;
            }
        }
        return ['Quality service', 'Customer focus', 'Industry expertise', 'Reliable solutions'];
    }
    generateCompetitivePosition(industry, size) {
        const industryLower = industry.toLowerCase();
        if (size === 'Startup') {
            return `Agile ${industry} innovator bringing fresh perspectives and cutting-edge solutions to market.`;
        }
        else if (size === 'Enterprise' || size === 'Corporation') {
            return `Established ${industry} leader with proven expertise and comprehensive solutions at scale.`;
        }
        else {
            return `Growing ${industry} company combining personalized service with professional expertise.`;
        }
    }
    generateBrandPersonality(industry, size) {
        const industryLower = industry.toLowerCase();
        const basePersonality = ['Professional', 'Reliable', 'Customer-focused'];
        if (industryLower.includes('technology')) {
            basePersonality.push('Innovative', 'Forward-thinking');
        }
        else if (industryLower.includes('healthcare')) {
            basePersonality.push('Caring', 'Trustworthy');
        }
        else if (industryLower.includes('finance')) {
            basePersonality.push('Trustworthy', 'Analytical');
        }
        if (size === 'Startup') {
            basePersonality.push('Agile', 'Dynamic');
        }
        else if (size === 'Enterprise' || size === 'Corporation') {
            basePersonality.push('Established', 'Authoritative');
        }
        return basePersonality;
    }
    generateInsights(company, size, targetMarket) {
        const insights = [];
        insights.push(`${company.name} operates in the ${company.industry} sector with a ${targetMarket} focus.`);
        insights.push(`As a ${size} company, content should emphasize ${this.getSizeBasedFocus(size)}.`);
        insights.push(`Location in ${company.location.city}, ${company.location.country} provides ${this.getLocationInsight(company.location.country)}.`);
        if (company.website) {
            insights.push(`Company website presence suggests established digital marketing capabilities.`);
        }
        return insights;
    }
    getSizeBasedFocus(size) {
        switch (size) {
            case 'Startup':
                return 'innovation, agility, and growth potential';
            case 'SMB':
                return 'personalized service and specialized expertise';
            case 'Enterprise':
                return 'proven solutions and industry leadership';
            case 'Corporation':
                return 'scale, reliability, and comprehensive offerings';
            default:
                return 'unique value proposition';
        }
    }
    getLocationInsight(country) {
        // Simple location-based insights
        const locationMap = {
            'United States': 'access to large diverse markets and innovation hubs',
            'Canada': 'stable business environment and multicultural perspectives',
            'United Kingdom': 'gateway to European markets and financial services expertise',
            'Germany': 'engineering excellence and manufacturing heritage',
            'Japan': 'technological innovation and quality-focused culture',
            'Australia': 'Asia-Pacific market access and resource industry strength'
        };
        return locationMap[country] || 'unique regional market opportunities';
    }
};
exports.CompanyContextService = CompanyContextService;
exports.CompanyContextService = CompanyContextService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(company_context_entity_1.CompanyContext)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], CompanyContextService);


/***/ }),
/* 56 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompanyContextController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const company_context_service_1 = __webpack_require__(55);
const company_context_dto_1 = __webpack_require__(57);
const jwt_auth_guard_1 = __webpack_require__(28);
let CompanyContextController = class CompanyContextController {
    constructor(companyContextService) {
        this.companyContextService = companyContextService;
    }
    async analyzeCompany(analyzeDto) {
        return await this.companyContextService.analyzeCompany(analyzeDto.companyId);
    }
    async getByCompanyId(companyId) {
        return await this.companyContextService.getByCompanyId(companyId);
    }
    async create(createDto) {
        return await this.companyContextService.create(createDto);
    }
    async update(companyId, updateDto) {
        return await this.companyContextService.update(companyId, updateDto);
    }
    async delete(companyId) {
        await this.companyContextService.delete(companyId);
    }
};
exports.CompanyContextController = CompanyContextController;
tslib_1.__decorate([
    (0, common_1.Post)('analyze'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof company_context_dto_1.AnalyzeCompanyRequestDto !== "undefined" && company_context_dto_1.AnalyzeCompanyRequestDto) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], CompanyContextController.prototype, "analyzeCompany", null);
tslib_1.__decorate([
    (0, common_1.Get)('company/:companyId'),
    tslib_1.__param(0, (0, common_1.Param)('companyId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], CompanyContextController.prototype, "getByCompanyId", null);
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof company_context_dto_1.CreateCompanyContextDto !== "undefined" && company_context_dto_1.CreateCompanyContextDto) === "function" ? _c : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], CompanyContextController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Put)('company/:companyId'),
    tslib_1.__param(0, (0, common_1.Param)('companyId')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_d = typeof company_context_dto_1.UpdateCompanyContextDto !== "undefined" && company_context_dto_1.UpdateCompanyContextDto) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], CompanyContextController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Delete)('company/:companyId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    tslib_1.__param(0, (0, common_1.Param)('companyId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], CompanyContextController.prototype, "delete", null);
exports.CompanyContextController = CompanyContextController = tslib_1.__decorate([
    (0, common_1.Controller)('company-context'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof company_context_service_1.CompanyContextService !== "undefined" && company_context_service_1.CompanyContextService) === "function" ? _a : Object])
], CompanyContextController);


/***/ }),
/* 57 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnalyzeCompanyRequestDto = exports.UpdateCompanyContextDto = exports.CreateCompanyContextDto = void 0;
const tslib_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(27);
const shared_1 = __webpack_require__(15);
class CreateCompanyContextDto {
}
exports.CreateCompanyContextDto = CreateCompanyContextDto;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], CreateCompanyContextDto.prototype, "companyId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCompanyContextDto.prototype, "industryVertical", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(['Startup', 'SMB', 'Enterprise', 'Corporation']),
    tslib_1.__metadata("design:type", typeof (_a = typeof shared_1.CompanySizeIndicator !== "undefined" && shared_1.CompanySizeIndicator) === "function" ? _a : Object)
], CreateCompanyContextDto.prototype, "companySizeIndicator", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(['B2B', 'B2C', 'B2B2C']),
    tslib_1.__metadata("design:type", typeof (_b = typeof shared_1.TargetMarket !== "undefined" && shared_1.TargetMarket) === "function" ? _b : Object)
], CreateCompanyContextDto.prototype, "targetMarket", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], CreateCompanyContextDto.prototype, "contentThemes", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], CreateCompanyContextDto.prototype, "keyDifferentiators", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCompanyContextDto.prototype, "competitivePosition", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], CreateCompanyContextDto.prototype, "brandPersonality", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], CreateCompanyContextDto.prototype, "generatedInsights", void 0);
class UpdateCompanyContextDto {
}
exports.UpdateCompanyContextDto = UpdateCompanyContextDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateCompanyContextDto.prototype, "industryVertical", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(['Startup', 'SMB', 'Enterprise', 'Corporation']),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", typeof (_c = typeof shared_1.CompanySizeIndicator !== "undefined" && shared_1.CompanySizeIndicator) === "function" ? _c : Object)
], UpdateCompanyContextDto.prototype, "companySizeIndicator", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(['B2B', 'B2C', 'B2B2C']),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", typeof (_d = typeof shared_1.TargetMarket !== "undefined" && shared_1.TargetMarket) === "function" ? _d : Object)
], UpdateCompanyContextDto.prototype, "targetMarket", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], UpdateCompanyContextDto.prototype, "contentThemes", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], UpdateCompanyContextDto.prototype, "keyDifferentiators", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateCompanyContextDto.prototype, "competitivePosition", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], UpdateCompanyContextDto.prototype, "brandPersonality", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], UpdateCompanyContextDto.prototype, "generatedInsights", void 0);
class AnalyzeCompanyRequestDto {
}
exports.AnalyzeCompanyRequestDto = AnalyzeCompanyRequestDto;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], AnalyzeCompanyRequestDto.prototype, "companyId", void 0);


/***/ }),
/* 58 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WriterProfilesModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const writer_profiles_service_1 = __webpack_require__(59);
const writer_profiles_controller_1 = __webpack_require__(60);
const writer_profile_entity_1 = __webpack_require__(34);
const company_entity_1 = __webpack_require__(24);
const company_context_entity_1 = __webpack_require__(35);
const user_entity_1 = __webpack_require__(14);
let WriterProfilesModule = class WriterProfilesModule {
};
exports.WriterProfilesModule = WriterProfilesModule;
exports.WriterProfilesModule = WriterProfilesModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([writer_profile_entity_1.WriterProfile, company_entity_1.Company, company_context_entity_1.CompanyContext, user_entity_1.User])],
        controllers: [writer_profiles_controller_1.WriterProfilesController],
        providers: [writer_profiles_service_1.WriterProfilesService],
        exports: [writer_profiles_service_1.WriterProfilesService],
    })
], WriterProfilesModule);


/***/ }),
/* 59 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WriterProfilesService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(12);
const writer_profile_entity_1 = __webpack_require__(34);
const company_entity_1 = __webpack_require__(24);
const company_context_entity_1 = __webpack_require__(35);
const user_entity_1 = __webpack_require__(14);
let WriterProfilesService = class WriterProfilesService {
    constructor(writerProfileRepository, companyRepository, companyContextRepository, userRepository) {
        this.writerProfileRepository = writerProfileRepository;
        this.companyRepository = companyRepository;
        this.companyContextRepository = companyContextRepository;
        this.userRepository = userRepository;
    }
    async generateProfiles(generateDto) {
        const { companyId, userId, count = 3 } = generateDto;
        // Verify company and user exist
        const company = await this.companyRepository.findOne({ where: { id: companyId } });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        // Get or create company context
        let companyContext = await this.companyContextRepository.findOne({ where: { companyId } });
        if (!companyContext) {
            throw new common_1.NotFoundException('Company context not found. Please analyze company first.');
        }
        // Generate writer profiles based on company context
        const profileTemplates = this.generateProfileTemplates(company, companyContext, count);
        // Create and save profiles
        const profiles = [];
        for (const template of profileTemplates) {
            const profile = this.writerProfileRepository.create({
                companyId,
                userId,
                name: template.name,
                position: template.position,
                tone: template.tone,
                style: template.style,
                targetAudience: template.targetAudience,
                contentFocusAreas: template.contentFocusAreas,
                socialPlatforms: [], // Will be set later via platform selection
                companyFocusTips: template.companyFocusTips,
                isCustom: false,
                isActive: true
            });
            const savedProfile = await this.writerProfileRepository.save(profile);
            profiles.push(savedProfile);
        }
        // Generate suggested social platforms
        const suggestedPlatforms = this.generateSuggestedPlatforms(companyContext);
        return {
            profiles,
            companyContext,
            suggestedPlatforms
        };
    }
    async getByCompanyAndUser(companyId, userId, activeOnly = true) {
        const where = { companyId, userId };
        if (activeOnly) {
            where.isActive = true;
        }
        return await this.writerProfileRepository.find({
            where,
            relations: ['company', 'user'],
            order: { createdAt: 'ASC' }
        });
    }
    async getById(id) {
        const profile = await this.writerProfileRepository.findOne({
            where: { id },
            relations: ['company', 'user']
        });
        if (!profile) {
            throw new common_1.NotFoundException('Writer profile not found');
        }
        return profile;
    }
    async create(createDto) {
        // Verify company and user exist
        const company = await this.companyRepository.findOne({ where: { id: createDto.companyId } });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        const user = await this.userRepository.findOne({ where: { id: createDto.userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const profile = this.writerProfileRepository.create({
            ...createDto,
            isCustom: true, // User-created profiles are marked as custom
            isActive: true
        });
        return await this.writerProfileRepository.save(profile);
    }
    async update(id, updateDto) {
        const profile = await this.getById(id);
        // If any content is modified, mark as custom
        const contentFields = ['name', 'position', 'tone', 'style', 'targetAudience', 'contentFocusAreas', 'companyFocusTips'];
        const isContentModified = contentFields.some(field => updateDto[field] !== undefined);
        if (isContentModified && !profile.isCustom) {
            updateDto = { ...updateDto, isCustom: true };
        }
        Object.assign(profile, updateDto);
        return await this.writerProfileRepository.save(profile);
    }
    async delete(id) {
        const profile = await this.getById(id);
        await this.writerProfileRepository.remove(profile);
    }
    async updateSocialPlatforms(id, socialPlatforms) {
        const profile = await this.getById(id);
        profile.socialPlatforms = socialPlatforms;
        return await this.writerProfileRepository.save(profile);
    }
    generateProfileTemplates(company, context, count) {
        const industry = company.industry.toLowerCase();
        const profiles = [];
        // Get industry-specific base templates
        const baseTemplates = this.getIndustryTemplates(industry);
        // Generate profiles based on company size and target market
        const selectedTemplates = this.selectTemplates(baseTemplates, context, count);
        // Customize templates with company-specific information
        for (const template of selectedTemplates) {
            profiles.push(this.customizeTemplate(template, company, context));
        }
        return profiles;
    }
    getIndustryTemplates(industry) {
        const industryTemplateMap = {
            'technology': [
                {
                    name: 'Tech Innovator Voice',
                    position: 'Technical Leader',
                    tone: 'Technical',
                    style: 'Informative',
                    targetAudience: 'Technical Professionals',
                    contentFocusAreas: ['Technical Innovation', 'Product Development', 'Industry Trends', 'Best Practices'],
                    companyFocusTips: []
                },
                {
                    name: 'Product Marketing Voice',
                    position: 'Product Marketing Manager',
                    tone: 'Professional',
                    style: 'Persuasive',
                    targetAudience: 'Business Decision Makers',
                    contentFocusAreas: ['Product Features', 'Market Solutions', 'Customer Success', 'ROI Insights'],
                    companyFocusTips: []
                },
                {
                    name: 'Thought Leader Voice',
                    position: 'Technology Evangelist',
                    tone: 'Inspirational',
                    style: 'Educational',
                    targetAudience: 'Industry Peers',
                    contentFocusAreas: ['Future of Technology', 'Industry Insights', 'Innovation Trends', 'Digital Transformation'],
                    companyFocusTips: []
                }
            ],
            'healthcare': [
                {
                    name: 'Clinical Expert Voice',
                    position: 'Medical Professional',
                    tone: 'Professional',
                    style: 'Informative',
                    targetAudience: 'Healthcare Professionals',
                    contentFocusAreas: ['Clinical Excellence', 'Patient Care', 'Medical Innovation', 'Treatment Outcomes'],
                    companyFocusTips: []
                },
                {
                    name: 'Patient Advocate Voice',
                    position: 'Patient Relations Specialist',
                    tone: 'Friendly',
                    style: 'Educational',
                    targetAudience: 'Patients and Families',
                    contentFocusAreas: ['Patient Education', 'Health & Wellness', 'Treatment Support', 'Community Health'],
                    companyFocusTips: []
                },
                {
                    name: 'Healthcare Leader Voice',
                    position: 'Healthcare Executive',
                    tone: 'Professional',
                    style: 'Analytical',
                    targetAudience: 'Healthcare Decision Makers',
                    contentFocusAreas: ['Healthcare Policy', 'Industry Trends', 'Quality Improvement', 'Healthcare Innovation'],
                    companyFocusTips: []
                }
            ],
            'finance': [
                {
                    name: 'Financial Advisor Voice',
                    position: 'Senior Financial Consultant',
                    tone: 'Professional',
                    style: 'Analytical',
                    targetAudience: 'Individual Investors',
                    contentFocusAreas: ['Investment Strategies', 'Financial Planning', 'Market Analysis', 'Risk Management'],
                    companyFocusTips: []
                },
                {
                    name: 'Market Analyst Voice',
                    position: 'Market Research Analyst',
                    tone: 'Technical',
                    style: 'Informative',
                    targetAudience: 'Financial Professionals',
                    contentFocusAreas: ['Market Trends', 'Economic Insights', 'Investment Research', 'Financial Data'],
                    companyFocusTips: []
                },
                {
                    name: 'Client Relations Voice',
                    position: 'Client Success Manager',
                    tone: 'Friendly',
                    style: 'Educational',
                    targetAudience: 'Current Clients',
                    contentFocusAreas: ['Client Education', 'Service Updates', 'Financial Tips', 'Success Stories'],
                    companyFocusTips: []
                }
            ]
        };
        // Return industry-specific templates or generic ones
        return industryTemplateMap[industry] || this.getGenericTemplates();
    }
    getGenericTemplates() {
        return [
            {
                name: 'Company Leader Voice',
                position: 'Executive Leadership',
                tone: 'Professional',
                style: 'Informative',
                targetAudience: 'Industry Professionals',
                contentFocusAreas: ['Industry Leadership', 'Company Vision', 'Market Insights', 'Business Strategy'],
                companyFocusTips: []
            },
            {
                name: 'Customer Success Voice',
                position: 'Customer Success Manager',
                tone: 'Friendly',
                style: 'Educational',
                targetAudience: 'Current and Potential Customers',
                contentFocusAreas: ['Customer Success', 'Product Education', 'Best Practices', 'Case Studies'],
                companyFocusTips: []
            },
            {
                name: 'Industry Expert Voice',
                position: 'Subject Matter Expert',
                tone: 'Professional',
                style: 'Analytical',
                targetAudience: 'Industry Peers',
                contentFocusAreas: ['Industry Trends', 'Expert Insights', 'Research Findings', 'Professional Development'],
                companyFocusTips: []
            }
        ];
    }
    selectTemplates(baseTemplates, context, count) {
        // For now, return the first 'count' templates
        // In the future, this could be more intelligent based on company context
        return baseTemplates.slice(0, Math.min(count, baseTemplates.length));
    }
    customizeTemplate(template, company, context) {
        // Customize company focus tips based on company and context
        const customizedTips = this.generateCompanyFocusTips(template, company, context);
        return {
            ...template,
            companyFocusTips: customizedTips
        };
    }
    generateCompanyFocusTips(template, company, context) {
        const tips = [];
        // Base tips from company context
        tips.push(`Emphasize ${company.name}'s position as a ${context.companySizeIndicator} in the ${context.industryVertical} sector`);
        tips.push(`Target ${context.targetMarket} audiences with content that resonates with their specific needs`);
        // Add location-based tip
        if (company.location?.city && company.location?.country) {
            tips.push(`Leverage ${company.location.city}, ${company.location.country} market presence and local insights`);
        }
        // Add differentiation tips
        if (context.keyDifferentiators?.length > 0) {
            tips.push(`Highlight key differentiators: ${context.keyDifferentiators.slice(0, 2).join(', ')}`);
        }
        // Add brand personality tip
        if (context.brandPersonality?.length > 0) {
            tips.push(`Maintain brand personality: ${context.brandPersonality.slice(0, 3).join(', ')}`);
        }
        // Role-specific tips
        if (template.position.toLowerCase().includes('technical')) {
            tips.push('Include technical depth while remaining accessible to your target audience');
        }
        else if (template.position.toLowerCase().includes('marketing')) {
            tips.push('Focus on customer benefits and business value propositions');
        }
        else if (template.position.toLowerCase().includes('executive')) {
            tips.push('Provide strategic insights and industry leadership perspectives');
        }
        return tips;
    }
    generateSuggestedPlatforms(context) {
        // This would typically come from a platforms database/service
        // For now, return a static list based on target market
        const allPlatforms = [
            {
                id: 'linkedin',
                name: 'linkedin',
                displayName: 'LinkedIn',
                description: 'Professional networking and B2B content',
                characterLimit: 3000,
                mediaSupport: ['image', 'video', 'document'],
                audienceType: 'Professional',
                contentFormats: ['post', 'article'],
                isActive: true,
                category: 'professional'
            },
            {
                id: 'twitter',
                name: 'twitter',
                displayName: 'X (Twitter)',
                description: 'Real-time updates and industry conversations',
                characterLimit: 280,
                mediaSupport: ['image', 'video'],
                audienceType: 'General',
                contentFormats: ['post', 'thread'],
                isActive: true,
                category: 'social'
            },
            {
                id: 'facebook',
                name: 'facebook',
                displayName: 'Facebook',
                description: 'Community building and customer engagement',
                characterLimit: 63206,
                mediaSupport: ['image', 'video'],
                audienceType: 'General',
                contentFormats: ['post', 'story'],
                isActive: true,
                category: 'social'
            },
            {
                id: 'instagram',
                name: 'instagram',
                displayName: 'Instagram',
                description: 'Visual storytelling and brand building',
                characterLimit: 2200,
                mediaSupport: ['image', 'video'],
                audienceType: 'Visual',
                contentFormats: ['post', 'story', 'reel'],
                isActive: true,
                category: 'visual'
            }
        ];
        // Filter platforms based on target market
        if (context.targetMarket === 'B2B') {
            return allPlatforms.filter(p => ['linkedin', 'twitter'].includes(p.name));
        }
        else if (context.targetMarket === 'B2C') {
            return allPlatforms.filter(p => ['facebook', 'instagram', 'twitter'].includes(p.name));
        }
        else {
            // B2B2C - return all
            return allPlatforms;
        }
    }
};
exports.WriterProfilesService = WriterProfilesService;
exports.WriterProfilesService = WriterProfilesService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(writer_profile_entity_1.WriterProfile)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    tslib_1.__param(2, (0, typeorm_1.InjectRepository)(company_context_entity_1.CompanyContext)),
    tslib_1.__param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object])
], WriterProfilesService);


/***/ }),
/* 60 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WriterProfilesController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const writer_profiles_service_1 = __webpack_require__(59);
const writer_profiles_dto_1 = __webpack_require__(61);
const jwt_auth_guard_1 = __webpack_require__(28);
let WriterProfilesController = class WriterProfilesController {
    constructor(writerProfilesService) {
        this.writerProfilesService = writerProfilesService;
    }
    async generateProfiles(generateDto) {
        return await this.writerProfilesService.generateProfiles(generateDto);
    }
    async getProfiles(query) {
        if (query.companyId && query.userId) {
            return await this.writerProfilesService.getByCompanyAndUser(query.companyId, query.userId, query.activeOnly);
        }
        // If no specific filters, return empty array or implement general listing
        return [];
    }
    async getProfile(id) {
        return await this.writerProfilesService.getById(id);
    }
    async createProfile(createDto) {
        return await this.writerProfilesService.create(createDto);
    }
    async updateProfile(id, updateDto) {
        return await this.writerProfilesService.update(id, updateDto);
    }
    async updateSocialPlatforms(id, socialPlatforms) {
        return await this.writerProfilesService.updateSocialPlatforms(id, socialPlatforms);
    }
    async deleteProfile(id) {
        await this.writerProfilesService.delete(id);
    }
};
exports.WriterProfilesController = WriterProfilesController;
tslib_1.__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof writer_profiles_dto_1.GenerateWriterProfilesDto !== "undefined" && writer_profiles_dto_1.GenerateWriterProfilesDto) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], WriterProfilesController.prototype, "generateProfiles", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof writer_profiles_dto_1.GetWriterProfilesQueryDto !== "undefined" && writer_profiles_dto_1.GetWriterProfilesQueryDto) === "function" ? _c : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], WriterProfilesController.prototype, "getProfiles", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], WriterProfilesController.prototype, "getProfile", null);
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_d = typeof writer_profiles_dto_1.CreateWriterProfileDto !== "undefined" && writer_profiles_dto_1.CreateWriterProfileDto) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], WriterProfilesController.prototype, "createProfile", null);
tslib_1.__decorate([
    (0, common_1.Put)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_e = typeof writer_profiles_dto_1.UpdateWriterProfileDto !== "undefined" && writer_profiles_dto_1.UpdateWriterProfileDto) === "function" ? _e : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], WriterProfilesController.prototype, "updateProfile", null);
tslib_1.__decorate([
    (0, common_1.Put)(':id/social-platforms'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)('socialPlatforms')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Array]),
    tslib_1.__metadata("design:returntype", Promise)
], WriterProfilesController.prototype, "updateSocialPlatforms", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], WriterProfilesController.prototype, "deleteProfile", null);
exports.WriterProfilesController = WriterProfilesController = tslib_1.__decorate([
    (0, common_1.Controller)('writer-profiles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof writer_profiles_service_1.WriterProfilesService !== "undefined" && writer_profiles_service_1.WriterProfilesService) === "function" ? _a : Object])
], WriterProfilesController);


/***/ }),
/* 61 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetWriterProfilesQueryDto = exports.GenerateWriterProfilesDto = exports.UpdateWriterProfileDto = exports.CreateWriterProfileDto = void 0;
const tslib_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(27);
const shared_1 = __webpack_require__(15);
class CreateWriterProfileDto {
}
exports.CreateWriterProfileDto = CreateWriterProfileDto;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], CreateWriterProfileDto.prototype, "companyId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], CreateWriterProfileDto.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateWriterProfileDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateWriterProfileDto.prototype, "position", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(['Professional', 'Casual', 'Technical', 'Inspirational', 'Friendly']),
    tslib_1.__metadata("design:type", typeof (_a = typeof shared_1.WriterTone !== "undefined" && shared_1.WriterTone) === "function" ? _a : Object)
], CreateWriterProfileDto.prototype, "tone", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(['Informative', 'Persuasive', 'Educational', 'Entertaining', 'Analytical']),
    tslib_1.__metadata("design:type", typeof (_b = typeof shared_1.WriterStyle !== "undefined" && shared_1.WriterStyle) === "function" ? _b : Object)
], CreateWriterProfileDto.prototype, "style", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateWriterProfileDto.prototype, "targetAudience", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], CreateWriterProfileDto.prototype, "contentFocusAreas", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], CreateWriterProfileDto.prototype, "socialPlatforms", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], CreateWriterProfileDto.prototype, "companyFocusTips", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Boolean)
], CreateWriterProfileDto.prototype, "isCustom", void 0);
class UpdateWriterProfileDto {
}
exports.UpdateWriterProfileDto = UpdateWriterProfileDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateWriterProfileDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateWriterProfileDto.prototype, "position", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(['Professional', 'Casual', 'Technical', 'Inspirational', 'Friendly']),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", typeof (_c = typeof shared_1.WriterTone !== "undefined" && shared_1.WriterTone) === "function" ? _c : Object)
], UpdateWriterProfileDto.prototype, "tone", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(['Informative', 'Persuasive', 'Educational', 'Entertaining', 'Analytical']),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", typeof (_d = typeof shared_1.WriterStyle !== "undefined" && shared_1.WriterStyle) === "function" ? _d : Object)
], UpdateWriterProfileDto.prototype, "style", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateWriterProfileDto.prototype, "targetAudience", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], UpdateWriterProfileDto.prototype, "contentFocusAreas", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], UpdateWriterProfileDto.prototype, "socialPlatforms", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], UpdateWriterProfileDto.prototype, "companyFocusTips", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateWriterProfileDto.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateWriterProfileDto.prototype, "isCustom", void 0);
class GenerateWriterProfilesDto {
}
exports.GenerateWriterProfilesDto = GenerateWriterProfilesDto;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], GenerateWriterProfilesDto.prototype, "companyId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], GenerateWriterProfilesDto.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Number)
], GenerateWriterProfilesDto.prototype, "count", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Boolean)
], GenerateWriterProfilesDto.prototype, "includeCustomization", void 0);
class GetWriterProfilesQueryDto {
}
exports.GetWriterProfilesQueryDto = GetWriterProfilesQueryDto;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], GetWriterProfilesQueryDto.prototype, "companyId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], GetWriterProfilesQueryDto.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Boolean)
], GetWriterProfilesQueryDto.prototype, "activeOnly", void 0);


/***/ }),
/* 62 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentTopicsModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const content_topics_controller_1 = __webpack_require__(63);
const content_topics_service_1 = __webpack_require__(64);
const content_topic_entity_1 = __webpack_require__(36);
const user_entity_1 = __webpack_require__(14);
const company_entity_1 = __webpack_require__(24);
const writer_profile_entity_1 = __webpack_require__(34);
let ContentTopicsModule = class ContentTopicsModule {
};
exports.ContentTopicsModule = ContentTopicsModule;
exports.ContentTopicsModule = ContentTopicsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                content_topic_entity_1.ContentTopicEntity,
                user_entity_1.User,
                company_entity_1.Company,
                writer_profile_entity_1.WriterProfile
            ])
        ],
        controllers: [content_topics_controller_1.ContentTopicsController],
        providers: [content_topics_service_1.ContentTopicsService],
        exports: [content_topics_service_1.ContentTopicsService]
    })
], ContentTopicsModule);


/***/ }),
/* 63 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentTopicsController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const jwt_auth_guard_1 = __webpack_require__(28);
const content_topics_service_1 = __webpack_require__(64);
const content_topics_dto_1 = __webpack_require__(65);
const shared_1 = __webpack_require__(15);
let ContentTopicsController = class ContentTopicsController {
    constructor(contentTopicsService) {
        this.contentTopicsService = contentTopicsService;
    }
    async generateContentTopics(req, generateDto) {
        return this.contentTopicsService.generateContentTopics(req.user.id, generateDto);
    }
    async getContentTopics(req, companyId) {
        return this.contentTopicsService.getContentTopics(req.user.id, companyId);
    }
    getTopicCategories() {
        return shared_1.DEFAULT_TOPIC_CATEGORIES;
    }
    async getContentTopic(req, id) {
        return this.contentTopicsService.getContentTopic(req.user.id, id);
    }
    async updateContentTopic(req, id, updateDto) {
        return this.contentTopicsService.updateContentTopic(req.user.id, id, updateDto);
    }
    async deleteContentTopic(req, id) {
        return this.contentTopicsService.deleteContentTopic(req.user.id, id);
    }
};
exports.ContentTopicsController = ContentTopicsController;
tslib_1.__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_b = typeof content_topics_dto_1.GenerateContentTopicsDto !== "undefined" && content_topics_dto_1.GenerateContentTopicsDto) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], ContentTopicsController.prototype, "generateContentTopics", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Query)('companyId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], ContentTopicsController.prototype, "getContentTopics", null);
tslib_1.__decorate([
    (0, common_1.Get)('categories'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Array)
], ContentTopicsController.prototype, "getTopicCategories", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], ContentTopicsController.prototype, "getContentTopic", null);
tslib_1.__decorate([
    (0, common_1.Put)(':id'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, typeof (_f = typeof content_topics_dto_1.UpdateContentTopicDto !== "undefined" && content_topics_dto_1.UpdateContentTopicDto) === "function" ? _f : Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], ContentTopicsController.prototype, "updateContentTopic", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], ContentTopicsController.prototype, "deleteContentTopic", null);
exports.ContentTopicsController = ContentTopicsController = tslib_1.__decorate([
    (0, common_1.Controller)('content-topics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof content_topics_service_1.ContentTopicsService !== "undefined" && content_topics_service_1.ContentTopicsService) === "function" ? _a : Object])
], ContentTopicsController);


/***/ }),
/* 64 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var ContentTopicsService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentTopicsService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(12);
const shared_1 = __webpack_require__(15);
const content_topic_entity_1 = __webpack_require__(36);
const user_entity_1 = __webpack_require__(14);
const company_entity_1 = __webpack_require__(24);
const writer_profile_entity_1 = __webpack_require__(34);
let ContentTopicsService = ContentTopicsService_1 = class ContentTopicsService {
    constructor(contentTopicsRepository, userRepository, companyRepository, writerProfileRepository) {
        this.contentTopicsRepository = contentTopicsRepository;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.writerProfileRepository = writerProfileRepository;
        this.logger = new common_1.Logger(ContentTopicsService_1.name);
    }
    async generateContentTopics(userId, request) {
        this.logger.log(`Generating content topics for user ${userId}, company ${request.companyId}, year ${request.year}`);
        // Verify user exists
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        // Verify company exists
        const company = await this.companyRepository.findOne({
            where: { id: request.companyId }
        });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        // Get writer profiles for the company (optional)
        const writerProfiles = await this.writerProfileRepository.find({
            where: { companyId: request.companyId }
        });
        // Generate topics using AI-powered logic
        const topicsPerMonth = request.monthlyTopicCount || 4;
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        const generatedTopics = [];
        for (const month of months) {
            for (let i = 0; i < topicsPerMonth; i++) {
                const topic = await this.generateTopicForMonth(request, company, writerProfiles, month, i);
                // Create and save the topic entity
                const topicEntity = this.contentTopicsRepository.create({
                    ...topic,
                    companyId: request.companyId,
                    userId,
                });
                const savedTopic = await this.contentTopicsRepository.save(topicEntity);
                generatedTopics.push(savedTopic);
            }
        }
        // Generate suggestions
        const suggestions = {
            recommendedCategories: this.getRecommendedCategories(company, request.contentGoals),
            seasonalOpportunities: this.getSeasonalOpportunities(request.year),
            keywordOpportunities: this.generateKeywordOpportunities(company, request.contentGoals)
        };
        return {
            topics: generatedTopics,
            plan: {
                name: `${company.name} Content Plan ${request.year}`,
                description: `Annual content strategy for ${company.name} focusing on ${request.contentGoals.join(', ')}`,
                year: request.year,
                companyId: request.companyId,
                userId,
                topics: generatedTopics,
                goals: request.contentGoals,
                status: 'draft'
            },
            suggestions
        };
    }
    async generateTopicForMonth(request, company, writerProfiles, month, topicIndex) {
        // Use provided categories
        const categories = request.categories.length > 0 ? request.categories : shared_1.DEFAULT_TOPIC_CATEGORIES;
        const category = categories[topicIndex % categories.length];
        // Generate topic based on month, category, and company context
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = monthNames[month - 1];
        // Simple topic generation based on category and month
        const topicTemplates = {
            'product': [
                `New ${monthName} Product Features and Updates`,
                `How Our Product Solves ${monthName} Challenges`,
                `${monthName} Product Roadmap and Innovations`,
                `Customer Success with Our Product in ${monthName}`
            ],
            'behind-scenes': [
                `Behind the Scenes: ${monthName} at ${company.name}`,
                `Team Spotlight: ${monthName} Employee Stories`,
                `Our ${monthName} Company Culture and Values`,
                `Day in the Life: ${monthName} at ${company.name}`
            ],
            'thought-leadership': [
                `${monthName} Industry Trends and Predictions`,
                `Expert Insights: ${monthName} Market Analysis`,
                `The Future of Industry in ${monthName}`,
                `${monthName} Innovation and Technology Trends`
            ],
            'customer-success': [
                `${monthName} Customer Success Stories`,
                `Client Testimonials: ${monthName} Highlights`,
                `Case Study: ${monthName} Implementation Success`,
                `Customer Journey: ${monthName} Transformation`
            ],
            'education': [
                `${monthName} Best Practices and Tips`,
                `How-to Guide: ${monthName} Implementation`,
                `${monthName} Tutorial: Step-by-Step Guide`,
                `Learning Resources for ${monthName}`
            ],
            'company-news': [
                `${monthName} Company Announcements`,
                `${monthName} Milestones and Achievements`,
                `Company Updates: ${monthName} Progress`,
                `${monthName} News and Press Releases`
            ]
        };
        const templates = topicTemplates[category.id] || topicTemplates['product'];
        const title = templates[topicIndex % templates.length];
        // Generate description based on title and company
        const description = `Comprehensive content piece focusing on ${title.toLowerCase()} for ${company.name}. This ${category.name.toLowerCase()} content will engage our target audience and support our content marketing goals.`;
        // Generate keywords based on category and company
        const baseKeywords = [
            company.name.toLowerCase(),
            category.name.toLowerCase().replace(' ', '-'),
            monthName.toLowerCase(),
            company.industry?.toLowerCase() || 'business'
        ];
        // Add seasonal keywords if applicable
        const seasonalKeywords = this.getSeasonalKeywords(month);
        const keywords = [...baseKeywords, ...seasonalKeywords];
        // Generate SEO keywords
        const seoKeywords = [
            `${company.name} ${category.name.toLowerCase()}`,
            `${company.industry || 'business'} ${monthName.toLowerCase()}`,
            ...keywords
        ];
        // Assign writer profile if available
        const writerProfileId = writerProfiles.length > 0
            ? writerProfiles[topicIndex % writerProfiles.length].id
            : undefined;
        return {
            title,
            description,
            category,
            keywords: keywords.slice(0, 8), // Limit to 8 keywords
            plannedMonth: month,
            plannedYear: request.year,
            priority: this.determinePriority(month, topicIndex, request.contentGoals),
            status: 'planned',
            writerProfileId,
            seasonalEvents: this.getSeasonalEventsForMonth(month),
            targetAudience: this.generateTargetAudience(company, category),
            seoKeywords: seoKeywords.slice(0, 10), // Limit to 10 SEO keywords
            estimatedReadTime: this.estimateReadingTime(category),
            contentGoals: request.contentGoals // Add required contentGoals field
        };
    }
    getRecommendedCategories(company, goals) {
        // Return categories based on company industry and goals
        const relevantCategories = shared_1.DEFAULT_TOPIC_CATEGORIES.filter(category => {
            if (goals.some(g => g === 'product_promotion')) {
                return ['product', 'customer-success'].includes(category.id);
            }
            if (goals.some(g => g === 'thought_leadership')) {
                return ['thought-leadership', 'education'].includes(category.id);
            }
            if (goals.some(g => g === 'brand_awareness')) {
                return ['behind-scenes', 'company-news'].includes(category.id);
            }
            return true;
        });
        return relevantCategories.length > 0 ? relevantCategories : shared_1.DEFAULT_TOPIC_CATEGORIES;
    }
    getSeasonalOpportunities(year) {
        return [
            {
                id: 'new-year',
                name: 'New Year Planning',
                date: `${year}-01-01`,
                type: 'holiday',
                description: 'New Year resolutions and planning content opportunities'
            },
            {
                id: 'valentines',
                name: "Valentine's Day",
                date: `${year}-02-14`,
                type: 'holiday',
                description: 'Love-themed content and customer appreciation'
            },
            {
                id: 'spring-launch',
                name: 'Spring Product Launch Season',
                date: `${year}-03-21`,
                type: 'product_cycle',
                description: 'Spring product launches and fresh starts'
            },
            {
                id: 'earth-day',
                name: 'Earth Day',
                date: `${year}-04-22`,
                type: 'awareness_day',
                description: 'Sustainability and environmental awareness content'
            },
            {
                id: 'summer-campaigns',
                name: 'Summer Campaign Season',
                date: `${year}-06-21`,
                type: 'product_cycle',
                description: 'Summer marketing campaigns and outdoor activities'
            },
            {
                id: 'back-to-school',
                name: 'Back to School',
                date: `${year}-09-01`,
                type: 'product_cycle',
                description: 'Education-focused content and productivity themes'
            },
            {
                id: 'halloween',
                name: 'Halloween',
                date: `${year}-10-31`,
                type: 'holiday',
                description: 'Creative and fun content opportunities'
            },
            {
                id: 'black-friday',
                name: 'Black Friday',
                date: `${year}-11-29`,
                type: 'product_cycle',
                description: 'Shopping season and promotional content'
            },
            {
                id: 'year-end',
                name: 'Year-End Reflection',
                date: `${year}-12-31`,
                type: 'awareness_day',
                description: 'Year in review and future planning content'
            }
        ];
    }
    generateKeywordOpportunities(company, goals) {
        const baseKeywords = [
            company.name,
            company.industry || 'business',
            'content marketing',
            'digital strategy'
        ];
        const goalKeywords = goals.flatMap(goal => {
            switch (goal) {
                case 'brand_awareness':
                    return ['brand building', 'awareness campaign', 'brand recognition'];
                case 'thought_leadership':
                    return ['industry insights', 'expert opinion', 'market trends'];
                case 'product_promotion':
                    return ['product launch', 'features', 'benefits', 'solutions'];
                case 'recruitment':
                    return ['careers', 'job opportunities', 'company culture'];
                case 'lead_generation':
                    return ['conversion', 'prospects', 'customer acquisition'];
                default:
                    return [];
            }
        });
        return [...baseKeywords, ...goalKeywords];
    }
    getSeasonalKeywords(month) {
        const seasonalKeywords = {
            1: ['new-year', 'resolutions', 'planning', 'goals'],
            2: ['valentine', 'love', 'relationships', 'appreciation'],
            3: ['spring', 'renewal', 'growth', 'fresh-start'],
            4: ['april', 'earth-day', 'sustainability', 'green'],
            5: ['may', 'mothers-day', 'appreciation', 'spring'],
            6: ['summer', 'vacation', 'outdoor', 'travel'],
            7: ['july', 'independence', 'freedom', 'celebration'],
            8: ['august', 'back-to-school', 'preparation', 'learning'],
            9: ['september', 'autumn', 'harvest', 'productivity'],
            10: ['october', 'halloween', 'spooky', 'creative'],
            11: ['november', 'thanksgiving', 'gratitude', 'black-friday'],
            12: ['december', 'holiday', 'year-end', 'celebration']
        };
        return seasonalKeywords[month] || [];
    }
    getSeasonalEventsForMonth(month) {
        const events = {
            1: ['New Year', 'CES', 'Planning Season'],
            2: ['Valentine\'s Day', 'Presidents Day'],
            3: ['Spring Equinox', 'Women\'s History Month'],
            4: ['Earth Day', 'Easter'],
            5: ['Mother\'s Day', 'Memorial Day'],
            6: ['Summer Solstice', 'Father\'s Day'],
            7: ['Independence Day', 'Summer Holidays'],
            8: ['Back to School', 'Summer\'s End'],
            9: ['Labor Day', 'Autumn Equinox'],
            10: ['Halloween', 'Breast Cancer Awareness'],
            11: ['Thanksgiving', 'Black Friday', 'Cyber Monday'],
            12: ['Christmas', 'New Year Prep', 'Year End']
        };
        return events[month] || [];
    }
    determinePriority(month, topicIndex, goals) {
        // High priority for key business months and important goals
        const keyMonths = [1, 3, 6, 9, 12]; // Quarter starts and year end
        const hasHighPriorityGoals = goals.some(g => ['product_promotion', 'lead_generation'].includes(g));
        if (keyMonths.includes(month) && hasHighPriorityGoals) {
            return 'high';
        }
        else if (topicIndex === 0) { // First topic of each month
            return 'high';
        }
        else if (topicIndex === 1) {
            return 'medium';
        }
        else {
            return 'low';
        }
    }
    generateTargetAudience(company, category) {
        const audiences = {
            'product': `${company.industry || 'Business'} professionals looking for solutions`,
            'behind-scenes': `${company.name} community and potential employees`,
            'thought-leadership': `Industry leaders and decision-makers in ${company.industry || 'business'}`,
            'customer-success': `Prospects and existing customers interested in success stories`,
            'education': `Professionals seeking to learn about ${company.industry || 'business'} best practices`,
            'company-news': `Stakeholders, customers, and industry observers`
        };
        return audiences[category.id] || `General ${company.industry || 'business'} audience`;
    }
    estimateReadingTime(category) {
        const readingTimes = {
            'product': 7, // Product content tends to be detailed
            'behind-scenes': 5, // More casual, shorter reads
            'thought-leadership': 10, // In-depth analysis
            'customer-success': 8, // Detailed case studies
            'education': 12, // Comprehensive guides
            'company-news': 3 // Brief announcements
        };
        return readingTimes[category.id] || 6;
    }
    async getContentTopics(userId, companyId) {
        const query = this.contentTopicsRepository
            .createQueryBuilder('topic')
            .where('topic.userId = :userId', { userId });
        if (companyId) {
            query.andWhere('topic.companyId = :companyId', { companyId });
        }
        return query
            .orderBy('topic.plannedYear', 'DESC')
            .addOrderBy('topic.plannedMonth', 'ASC')
            .addOrderBy('topic.priority', 'ASC')
            .getMany();
    }
    async getContentTopic(userId, topicId) {
        const topic = await this.contentTopicsRepository.findOne({
            where: { id: topicId, userId }
        });
        if (!topic) {
            throw new common_1.NotFoundException('Content topic not found');
        }
        return topic;
    }
    async updateContentTopic(userId, topicId, updateData) {
        const topic = await this.contentTopicsRepository.findOne({
            where: { id: topicId, userId }
        });
        if (!topic) {
            throw new common_1.NotFoundException('Content topic not found');
        }
        // Validate writer profile if provided
        if (updateData.writerProfileId) {
            const writerProfile = await this.writerProfileRepository.findOne({
                where: {
                    id: updateData.writerProfileId,
                    companyId: topic.companyId
                }
            });
            if (!writerProfile) {
                throw new common_1.BadRequestException('Writer profile not found or does not belong to the company');
            }
        }
        Object.assign(topic, updateData);
        return this.contentTopicsRepository.save(topic);
    }
    async deleteContentTopic(userId, topicId) {
        const topic = await this.contentTopicsRepository.findOne({
            where: { id: topicId, userId }
        });
        if (!topic) {
            throw new common_1.NotFoundException('Content topic not found');
        }
        await this.contentTopicsRepository.remove(topic);
    }
};
exports.ContentTopicsService = ContentTopicsService;
exports.ContentTopicsService = ContentTopicsService = ContentTopicsService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(content_topic_entity_1.ContentTopicEntity)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__param(2, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    tslib_1.__param(3, (0, typeorm_1.InjectRepository)(writer_profile_entity_1.WriterProfile)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object])
], ContentTopicsService);


/***/ }),
/* 65 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateContentTopicDto = exports.GenerateContentTopicsDto = void 0;
const tslib_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(27);
const class_transformer_1 = __webpack_require__(53);
const shared_1 = __webpack_require__(15);
// ContentGoal is a string union type, no DTO needed
class GenerateContentTopicsDto {
}
exports.GenerateContentTopicsDto = GenerateContentTopicsDto;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], GenerateContentTopicsDto.prototype, "companyId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], GenerateContentTopicsDto.prototype, "year", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], GenerateContentTopicsDto.prototype, "monthlyTopicCount", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => Object),
    tslib_1.__metadata("design:type", Array)
], GenerateContentTopicsDto.prototype, "categories", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(['brand_awareness', 'thought_leadership', 'product_promotion', 'lead_generation', 'recruitment', 'customer_education', 'industry_insights', 'company_culture'], { each: true }),
    tslib_1.__metadata("design:type", Array)
], GenerateContentTopicsDto.prototype, "contentGoals", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], GenerateContentTopicsDto.prototype, "includeSeasonal", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], GenerateContentTopicsDto.prototype, "focusKeywords", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], GenerateContentTopicsDto.prototype, "additionalInstructions", void 0);
class UpdateContentTopicDto {
}
exports.UpdateContentTopicDto = UpdateContentTopicDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateContentTopicDto.prototype, "title", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateContentTopicDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Object),
    tslib_1.__metadata("design:type", typeof (_a = typeof shared_1.TopicCategory !== "undefined" && shared_1.TopicCategory) === "function" ? _a : Object)
], UpdateContentTopicDto.prototype, "category", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], UpdateContentTopicDto.prototype, "keywords", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], UpdateContentTopicDto.prototype, "plannedMonth", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], UpdateContentTopicDto.prototype, "plannedYear", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['high', 'medium', 'low']),
    tslib_1.__metadata("design:type", String)
], UpdateContentTopicDto.prototype, "priority", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['planned', 'in_progress', 'completed', 'cancelled']),
    tslib_1.__metadata("design:type", String)
], UpdateContentTopicDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], UpdateContentTopicDto.prototype, "writerProfileId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], UpdateContentTopicDto.prototype, "seasonalEvents", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateContentTopicDto.prototype, "targetAudience", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], UpdateContentTopicDto.prototype, "seoKeywords", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], UpdateContentTopicDto.prototype, "estimatedReadTime", void 0);


/***/ }),
/* 66 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BlogPostsModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const blog_posts_controller_1 = __webpack_require__(67);
const blog_posts_service_1 = __webpack_require__(68);
const blog_post_entity_1 = __webpack_require__(38);
const blog_post_section_entity_1 = __webpack_require__(39);
const content_topic_entity_1 = __webpack_require__(36);
const writer_profile_entity_1 = __webpack_require__(34);
const company_entity_1 = __webpack_require__(24);
const version_control_module_1 = __webpack_require__(73);
const rbac_module_1 = __webpack_require__(77);
let BlogPostsModule = class BlogPostsModule {
};
exports.BlogPostsModule = BlogPostsModule;
exports.BlogPostsModule = BlogPostsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                blog_post_entity_1.BlogPost,
                blog_post_section_entity_1.BlogPostSection,
                content_topic_entity_1.ContentTopic,
                writer_profile_entity_1.WriterProfile,
                company_entity_1.Company
            ]),
            version_control_module_1.VersionControlModule,
            rbac_module_1.RBACModule
        ],
        controllers: [blog_posts_controller_1.BlogPostsController],
        providers: [blog_posts_service_1.BlogPostsService],
        exports: [blog_posts_service_1.BlogPostsService]
    })
], BlogPostsModule);


/***/ }),
/* 67 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BlogPostsController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const blog_posts_service_1 = __webpack_require__(68);
const jwt_auth_guard_1 = __webpack_require__(28);
const permission_guard_1 = __webpack_require__(69);
const require_permission_decorator_1 = __webpack_require__(71);
const blog_posts_dto_1 = __webpack_require__(72);
const shared_1 = __webpack_require__(15);
let BlogPostsController = class BlogPostsController {
    constructor(blogPostsService) {
        this.blogPostsService = blogPostsService;
    }
    async generateBlogPost(generateRequest, req) {
        return this.blogPostsService.generateBlogPost(generateRequest, req.user.id);
    }
    async getBlogPostsByCompany(companyId, req) {
        return this.blogPostsService.getBlogPostsByCompany(companyId, req.user.id);
    }
    async getBlogPost(id, req) {
        return this.blogPostsService.getBlogPost(id, req.user.id);
    }
    async updateBlogPostSection(blogPostId, sectionId, updateRequest, req) {
        return this.blogPostsService.updateBlogPostSection(blogPostId, sectionId, updateRequest, req.user.id);
    }
    async regenerateBlogPostSection(blogPostId, sectionId, regenerateRequest, req) {
        return this.blogPostsService.regenerateBlogPostSection(blogPostId, sectionId, regenerateRequest, req.user.id);
    }
    async deleteBlogPost(id, req) {
        return this.blogPostsService.deleteBlogPost(id, req.user.id);
    }
    async regenerateSection(blogPostId, sectionId, regenerateRequest, req) {
        return this.blogPostsService.regenerateSection(blogPostId, sectionId, regenerateRequest, req.user.id);
    }
    async deleteSection(blogPostId, sectionId, req) {
        return this.blogPostsService.deleteSection(blogPostId, sectionId, req.user.id);
    }
    async approveBlogPost(id, approveRequest, req) {
        return this.blogPostsService.approveBlogPost(id, approveRequest, req.user.id);
    }
};
exports.BlogPostsController = BlogPostsController;
tslib_1.__decorate([
    (0, common_1.Post)('generate'),
    (0, require_permission_decorator_1.RequirePermission)('content:create', 'blog_posts'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof blog_posts_dto_1.GenerateBlogPostRequestDto !== "undefined" && blog_posts_dto_1.GenerateBlogPostRequestDto) === "function" ? _b : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], BlogPostsController.prototype, "generateBlogPost", null);
tslib_1.__decorate([
    (0, common_1.Get)('company/:companyId'),
    (0, require_permission_decorator_1.RequirePermission)('content:read', 'blog_posts'),
    tslib_1.__param(0, (0, common_1.Param)('companyId')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], BlogPostsController.prototype, "getBlogPostsByCompany", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], BlogPostsController.prototype, "getBlogPost", null);
tslib_1.__decorate([
    (0, common_1.Put)(':id/sections/:sectionId'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Param)('sectionId')),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__param(3, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, typeof (_f = typeof blog_posts_dto_1.UpdateBlogPostSectionRequestDto !== "undefined" && blog_posts_dto_1.UpdateBlogPostSectionRequestDto) === "function" ? _f : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], BlogPostsController.prototype, "updateBlogPostSection", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/sections/:sectionId/regenerate'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Param)('sectionId')),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__param(3, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, typeof (_h = typeof blog_posts_dto_1.RegenerateBlogPostSectionRequestDto !== "undefined" && blog_posts_dto_1.RegenerateBlogPostSectionRequestDto) === "function" ? _h : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], BlogPostsController.prototype, "regenerateBlogPostSection", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], BlogPostsController.prototype, "deleteBlogPost", null);
tslib_1.__decorate([
    (0, common_1.Post)(':blogPostId/sections/:sectionId/regenerate'),
    tslib_1.__param(0, (0, common_1.Param)('blogPostId')),
    tslib_1.__param(1, (0, common_1.Param)('sectionId')),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__param(3, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, typeof (_l = typeof shared_1.RegenerateBlogPostSectionRequest !== "undefined" && shared_1.RegenerateBlogPostSectionRequest) === "function" ? _l : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], BlogPostsController.prototype, "regenerateSection", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':blogPostId/sections/:sectionId'),
    tslib_1.__param(0, (0, common_1.Param)('blogPostId')),
    tslib_1.__param(1, (0, common_1.Param)('sectionId')),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], BlogPostsController.prototype, "deleteSection", null);
tslib_1.__decorate([
    (0, common_1.Put)(':id/approve'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_p = typeof shared_1.ApproveBlogPostRequest !== "undefined" && shared_1.ApproveBlogPostRequest) === "function" ? _p : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_q = typeof Promise !== "undefined" && Promise) === "function" ? _q : Object)
], BlogPostsController.prototype, "approveBlogPost", null);
exports.BlogPostsController = BlogPostsController = tslib_1.__decorate([
    (0, common_1.Controller)('blog-posts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof blog_posts_service_1.BlogPostsService !== "undefined" && blog_posts_service_1.BlogPostsService) === "function" ? _a : Object])
], BlogPostsController);


/***/ }),
/* 68 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BlogPostsService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(12);
const blog_post_entity_1 = __webpack_require__(38);
const blog_post_section_entity_1 = __webpack_require__(39);
const content_topic_entity_1 = __webpack_require__(36);
const writer_profile_entity_1 = __webpack_require__(34);
const company_entity_1 = __webpack_require__(24);
let BlogPostsService = class BlogPostsService {
    constructor(blogPostRepository, sectionRepository, contentTopicRepository, writerProfileRepository, companyRepository) {
        this.blogPostRepository = blogPostRepository;
        this.sectionRepository = sectionRepository;
        this.contentTopicRepository = contentTopicRepository;
        this.writerProfileRepository = writerProfileRepository;
        this.companyRepository = companyRepository;
    }
    async generateBlogPost(request, userId) {
        // Get the content topic
        const contentTopic = await this.contentTopicRepository.findOne({
            where: { id: request.contentTopicId, userId },
            relations: ['category']
        });
        if (!contentTopic) {
            throw new common_1.NotFoundException('Content topic not found');
        }
        // Get company information
        const company = await this.companyRepository.findOne({
            where: { id: contentTopic.companyId }
        });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        // Get writer profile if specified
        let writerProfile = null;
        if (request.writerProfileId) {
            writerProfile = await this.writerProfileRepository.findOne({
                where: { id: request.writerProfileId, userId }
            });
        }
        // Generate blog post outline and content using AI
        const { blogPost, outline, sections } = await this.generateBlogContent(contentTopic, company, writerProfile, request);
        // Create blog post entity
        const newBlogPost = this.blogPostRepository.create({
            contentTopicId: request.contentTopicId,
            companyId: contentTopic.companyId,
            userId,
            writerProfileId: request.writerProfileId,
            title: blogPost.title,
            subtitle: blogPost.subtitle,
            excerpt: blogPost.excerpt,
            fullContent: this.assembleBlogContent(sections),
            status: 'outline_review',
            wordCount: this.calculateWordCount(sections),
            estimatedReadTime: this.calculateReadTime(sections),
            seoMetadata: blogPost.seoMetadata,
            tags: blogPost.tags
        });
        const savedBlogPost = await this.blogPostRepository.save(newBlogPost);
        // Create sections
        const blogPostSections = sections.map((section, index) => this.sectionRepository.create({
            blogPostId: savedBlogPost.id,
            title: section.title,
            content: section.content,
            purpose: section.purpose,
            order: index + 1,
            status: 'pending',
            wordCount: section.content.split(' ').length
        }));
        await this.sectionRepository.save(blogPostSections);
        // Fetch the complete blog post with sections
        const completeBlogPost = await this.blogPostRepository.findOne({
            where: { id: savedBlogPost.id },
            relations: ['sections']
        });
        return {
            blogPost: this.mapToInterface(completeBlogPost),
            outline,
            suggestions: {
                alternativeTitles: await this.generateAlternativeTitles(blogPost.title, contentTopic),
                additionalSections: await this.suggestAdditionalSections(contentTopic, company),
                relatedTopics: await this.findRelatedTopics(contentTopic, userId)
            }
        };
    }
    async getBlogPostsByCompany(companyId, userId) {
        const blogPosts = await this.blogPostRepository.find({
            where: { companyId, userId },
            relations: ['sections'],
            order: { createdAt: 'DESC' }
        });
        return blogPosts.map(post => this.mapToInterface(post));
    }
    async getBlogPost(id, userId) {
        const blogPost = await this.blogPostRepository.findOne({
            where: { id, userId },
            relations: ['sections']
        });
        if (!blogPost) {
            throw new common_1.NotFoundException('Blog post not found');
        }
        return this.mapToInterface(blogPost);
    }
    async updateBlogPostSection(blogPostId, sectionId, request, userId) {
        // Verify ownership
        const blogPost = await this.blogPostRepository.findOne({
            where: { id: blogPostId, userId }
        });
        if (!blogPost) {
            throw new common_1.ForbiddenException('Blog post not found or access denied');
        }
        const section = await this.sectionRepository.findOne({
            where: { id: sectionId, blogPostId }
        });
        if (!section) {
            throw new common_1.NotFoundException('Section not found');
        }
        // Update section
        Object.assign(section, request);
        if (request.content) {
            section.wordCount = request.content.split(' ').length;
        }
        const updatedSection = await this.sectionRepository.save(section);
        // Update blog post full content and word count
        await this.updateBlogPostContent(blogPostId);
        return this.mapSectionToInterface(updatedSection);
    }
    async regenerateBlogPostSection(blogPostId, sectionId, request, userId) {
        // Verify ownership
        const blogPost = await this.blogPostRepository.findOne({
            where: { id: blogPostId, userId },
            relations: ['sections']
        });
        if (!blogPost) {
            throw new common_1.ForbiddenException('Blog post not found or access denied');
        }
        const section = await this.sectionRepository.findOne({
            where: { id: sectionId, blogPostId }
        });
        if (!section) {
            throw new common_1.NotFoundException('Section not found');
        }
        // Generate new content for the section
        const newContent = await this.generateSectionContent(section, blogPost, request);
        section.content = newContent;
        section.wordCount = newContent.split(' ').length;
        section.status = 'pending';
        const updatedSection = await this.sectionRepository.save(section);
        // Update blog post full content
        await this.updateBlogPostContent(blogPostId);
        return this.mapSectionToInterface(updatedSection);
    }
    async deleteBlogPost(id, userId) {
        const blogPost = await this.blogPostRepository.findOne({
            where: { id, userId }
        });
        if (!blogPost) {
            throw new common_1.NotFoundException('Blog post not found');
        }
        await this.blogPostRepository.remove(blogPost);
    }
    // AI Content Generation Methods
    async generateBlogContent(contentTopic, company, writerProfile, request) {
        const targetWordCount = request.targetWordCount || 2500;
        // Generate blog post outline
        const outline = await this.generateOutline(contentTopic, company, writerProfile, targetWordCount);
        // Generate sections based on outline
        const sections = await this.generateSections(outline, contentTopic, company, writerProfile);
        // Create blog post metadata
        const blogPost = {
            title: contentTopic.title,
            subtitle: `A comprehensive guide to ${contentTopic.title.toLowerCase()}`,
            excerpt: contentTopic.description.length > 200
                ? contentTopic.description.substring(0, 200) + '...'
                : contentTopic.description,
            seoMetadata: {
                metaTitle: contentTopic.title + ` | ${company.name}`,
                metaDescription: contentTopic.description.substring(0, 160),
                focusKeywords: contentTopic.keywords,
                slug: this.generateSlug(contentTopic.title)
            },
            tags: [...contentTopic.keywords, contentTopic.category.name.toLowerCase()]
        };
        return { blogPost, outline, sections };
    }
    async generateOutline(contentTopic, company, writerProfile, targetWordCount) {
        // Mock AI-generated outline - in production this would call an AI service
        const sections = [
            {
                id: 'intro',
                title: 'Introduction',
                content: '',
                purpose: 'Hook the reader and introduce the main topic',
                order: 1,
                status: 'pending',
                wordCount: Math.floor(targetWordCount * 0.1)
            },
            {
                id: 'background',
                title: 'Background and Context',
                content: '',
                purpose: 'Provide necessary background information',
                order: 2,
                status: 'pending',
                wordCount: Math.floor(targetWordCount * 0.15)
            },
            {
                id: 'main-content',
                title: `Understanding ${contentTopic.title}`,
                content: '',
                purpose: 'Core content explaining the main concepts',
                order: 3,
                status: 'pending',
                wordCount: Math.floor(targetWordCount * 0.4)
            },
            {
                id: 'practical-tips',
                title: 'Practical Tips and Best Practices',
                content: '',
                purpose: 'Actionable advice readers can implement',
                order: 4,
                status: 'pending',
                wordCount: Math.floor(targetWordCount * 0.25)
            },
            {
                id: 'conclusion',
                title: 'Conclusion and Next Steps',
                content: '',
                purpose: 'Summarize key points and provide clear next actions',
                order: 5,
                status: 'pending',
                wordCount: Math.floor(targetWordCount * 0.1)
            }
        ];
        return {
            id: 'outline-' + Date.now(),
            title: contentTopic.title,
            sections,
            estimatedWordCount: targetWordCount,
            estimatedReadTime: Math.ceil(targetWordCount / 200), // Average reading speed
            keyTakeaways: [
                `Understanding the fundamentals of ${contentTopic.title}`,
                'Practical implementation strategies',
                'Best practices and common pitfalls to avoid',
                'Next steps for continued learning'
            ],
            targetAudience: contentTopic.targetAudience || 'Business professionals',
            seoFocusKeywords: contentTopic.keywords
        };
    }
    async generateSections(outline, contentTopic, company, writerProfile) {
        // Mock content generation - in production this would use AI
        const sections = outline.sections.map(section => ({
            ...section,
            content: this.generateMockContent(section, contentTopic, company, writerProfile)
        }));
        return sections;
    }
    generateMockContent(section, contentTopic, company, writerProfile) {
        const writerTone = writerProfile?.tone || 'professional';
        const companyContext = `At ${company.name}, we understand the importance of ${contentTopic.title.toLowerCase()}.`;
        switch (section.purpose) {
            case 'Hook the reader and introduce the main topic':
                return `${companyContext} In today's rapidly evolving business landscape, ${contentTopic.title.toLowerCase()} has become increasingly crucial for organizations looking to stay competitive. This comprehensive guide will explore the key concepts, practical applications, and actionable strategies you need to succeed.\n\nWhether you're a seasoned professional or just starting your journey, this article will provide valuable insights that you can immediately apply to your work. Let's dive into the essential aspects of ${contentTopic.title.toLowerCase()} and discover how it can transform your approach to business.`;
            case 'Provide necessary background information':
                return `To fully understand ${contentTopic.title.toLowerCase()}, it's important to first examine the context and underlying factors that have shaped its evolution. The concept has its roots in [relevant industry/field], where professionals recognized the need for more effective approaches to [related challenge].\n\nOver the past decade, several key trends have emerged that make ${contentTopic.title.toLowerCase()} more relevant than ever:\n\n• Digital transformation initiatives across industries\n• Changing customer expectations and behaviors\n• Increased focus on data-driven decision making\n• The need for more agile and responsive business processes\n\nUnderstanding these foundational elements will help you appreciate why ${contentTopic.title.toLowerCase()} has become such a critical component of modern business strategy.`;
            case 'Core content explaining the main concepts':
                return `At its core, ${contentTopic.title.toLowerCase()} involves a systematic approach to [relevant process/methodology]. The fundamental principles include:\n\n**1. Strategic Planning and Goal Setting**\nSuccessful implementation begins with clear objectives and well-defined success metrics. Organizations must align their ${contentTopic.title.toLowerCase()} initiatives with broader business goals.\n\n**2. Process Optimization**\nStreamlining existing workflows and identifying areas for improvement is essential. This involves analyzing current practices, identifying bottlenecks, and implementing more efficient solutions.\n\n**3. Technology Integration**\nLeveraging the right tools and platforms can significantly enhance your ${contentTopic.title.toLowerCase()} efforts. Consider solutions that offer scalability, integration capabilities, and user-friendly interfaces.\n\n**4. Stakeholder Engagement**\nEnsuring buy-in from all relevant parties is crucial for success. This includes leadership support, team member involvement, and clear communication throughout the process.\n\n**5. Continuous Improvement**\nThe best ${contentTopic.title.toLowerCase()} strategies are those that evolve over time, incorporating feedback, new insights, and changing business requirements.`;
            case 'Actionable advice readers can implement':
                return `Now that we've covered the theoretical foundation, let's explore practical strategies you can implement immediately:\n\n**Getting Started Checklist:**\n✓ Assess your current state and identify specific areas for improvement\n✓ Set realistic, measurable goals with clear timelines\n✓ Assemble a cross-functional team with diverse perspectives\n✓ Develop a pilot program to test your approach on a smaller scale\n\n**Best Practices to Follow:**\n\n• **Start Small, Scale Gradually**: Begin with manageable projects that can demonstrate quick wins and build momentum.\n\n• **Measure Everything**: Establish baseline metrics and track progress regularly to ensure you're moving in the right direction.\n\n• **Foster a Culture of Learning**: Encourage experimentation and view setbacks as opportunities to learn and improve.\n\n• **Invest in Training**: Ensure your team has the necessary skills and knowledge to execute your ${contentTopic.title.toLowerCase()} strategy effectively.\n\n**Common Pitfalls to Avoid:**\n- Trying to do too much too quickly\n- Neglecting to secure adequate resources and support\n- Failing to communicate the value proposition clearly\n- Ignoring user feedback and resistance to change`;
            case 'Summarize key points and provide clear next actions':
                return `${contentTopic.title} represents a significant opportunity for organizations willing to invest in strategic implementation and continuous improvement. Throughout this guide, we've explored the essential elements that contribute to success in this area.\n\n**Key Takeaways:**\n• Understanding the foundational principles is crucial for effective implementation\n• Success requires a balanced approach combining strategy, technology, and people\n• Starting with pilot programs and scaling gradually reduces risk and increases chances of success\n• Continuous measurement and improvement are essential for long-term sustainability\n\n**Your Next Steps:**\n1. Conduct an assessment of your current capabilities and identify priority areas\n2. Develop a preliminary roadmap with specific milestones and success metrics\n3. Begin building support among key stakeholders and decision-makers\n4. Consider partnering with experienced professionals or organizations to accelerate your progress\n\nAt ${company.name}, we're committed to helping organizations succeed in their ${contentTopic.title.toLowerCase()} journey. Our team of experts can provide guidance, resources, and support to ensure your initiatives deliver meaningful results.\n\nReady to take the next step? Contact us today to learn more about how we can help you achieve your goals.`;
            default:
                return `This section provides important information about ${contentTopic.title.toLowerCase()}. Content will be tailored to your specific requirements and business context. Our AI-powered system generates comprehensive, relevant content that aligns with your company's voice and objectives.`;
        }
    }
    async generateSectionContent(section, blogPost, request) {
        // Mock regeneration - in production this would use AI
        let newContent = section.content;
        if (request.length === 'shorter') {
            // Simulate shortening content
            const sentences = newContent.split('. ');
            newContent = sentences.slice(0, Math.ceil(sentences.length * 0.7)).join('. ');
        }
        else if (request.length === 'longer') {
            // Simulate expanding content
            newContent += '\n\nAdditional insights and details have been added to provide more comprehensive coverage of this topic. This expanded content includes more examples, deeper analysis, and additional practical applications that readers can implement in their own organizations.';
        }
        if (request.instructions) {
            newContent += `\n\n[Content regenerated with specific instructions: ${request.instructions}]`;
        }
        return newContent;
    }
    // Helper methods
    assembleBlogContent(sections) {
        return sections
            .sort((a, b) => a.order - b.order)
            .map(section => `## ${section.title}\n\n${section.content}`)
            .join('\n\n');
    }
    calculateWordCount(sections) {
        return sections.reduce((total, section) => {
            return total + (section.content ? section.content.split(' ').length : 0);
        }, 0);
    }
    calculateReadTime(sections) {
        const wordCount = this.calculateWordCount(sections);
        return Math.ceil(wordCount / 200); // Average reading speed of 200 WPM
    }
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    async generateAlternativeTitles(currentTitle, contentTopic) {
        // Mock alternative titles
        return [
            `The Complete Guide to ${currentTitle}`,
            `${currentTitle}: Best Practices and Strategies`,
            `Mastering ${currentTitle} in 2024`,
            `${currentTitle} Explained: A Practical Approach`,
            `Why ${currentTitle} Matters for Your Business`
        ];
    }
    async suggestAdditionalSections(contentTopic, company) {
        // Mock additional section suggestions
        return [
            'Case Study: Real-World Implementation',
            'ROI Analysis and Business Impact',
            'Future Trends and Predictions',
            'Expert Interviews and Insights',
            'Frequently Asked Questions'
        ];
    }
    async findRelatedTopics(contentTopic, userId) {
        // Mock related topics
        return [
            `Advanced ${contentTopic.title} Strategies`,
            `${contentTopic.title} vs Traditional Approaches`,
            `Measuring ${contentTopic.title} Success`,
            `Common ${contentTopic.title} Mistakes to Avoid`,
            `${contentTopic.title} Tools and Resources`
        ];
    }
    async updateBlogPostContent(blogPostId) {
        const blogPost = await this.blogPostRepository.findOne({
            where: { id: blogPostId },
            relations: ['sections']
        });
        if (blogPost) {
            blogPost.fullContent = this.assembleBlogContent(blogPost.sections);
            blogPost.wordCount = this.calculateWordCount(blogPost.sections);
            blogPost.estimatedReadTime = this.calculateReadTime(blogPost.sections);
            await this.blogPostRepository.save(blogPost);
        }
    }
    mapToInterface(blogPost) {
        return {
            id: blogPost.id,
            contentTopicId: blogPost.contentTopicId,
            companyId: blogPost.companyId,
            userId: blogPost.userId,
            writerProfileId: blogPost.writerProfileId,
            title: blogPost.title,
            subtitle: blogPost.subtitle,
            excerpt: blogPost.excerpt,
            outline: {
                id: 'outline-' + blogPost.id,
                title: blogPost.title,
                sections: blogPost.sections.map(s => this.mapSectionToInterface(s)),
                estimatedWordCount: blogPost.wordCount,
                estimatedReadTime: blogPost.estimatedReadTime,
                keyTakeaways: ['Key insights from the blog post'],
                targetAudience: 'Business professionals',
                seoFocusKeywords: blogPost.seoMetadata.focusKeywords
            },
            fullContent: blogPost.fullContent,
            status: blogPost.status,
            sections: blogPost.sections.map(s => this.mapSectionToInterface(s)),
            wordCount: blogPost.wordCount,
            targetWordCount: blogPost.targetWordCount,
            estimatedReadTime: blogPost.estimatedReadTime,
            seoMetadata: blogPost.seoMetadata,
            tags: blogPost.tags || [],
            publishedAt: blogPost.publishedAt,
            createdAt: blogPost.createdAt,
            updatedAt: blogPost.updatedAt
        };
    }
    mapSectionToInterface(section) {
        return {
            id: section.id,
            title: section.title,
            content: section.content,
            purpose: section.purpose,
            order: section.order,
            status: section.status,
            wordCount: section.wordCount,
            suggestions: section.suggestions
        };
    }
    async regenerateSection(blogPostId, sectionId, regenerateRequest, userId) {
        const blogPost = await this.blogPostRepository.findOne({
            where: { id: blogPostId, userId },
            relations: ['sections', 'contentTopic', 'writerProfile', 'company']
        });
        if (!blogPost) {
            throw new common_1.NotFoundException('Blog post not found');
        }
        const section = blogPost.sections.find(s => s.id === sectionId);
        if (!section) {
            throw new common_1.NotFoundException('Section not found');
        }
        // Mock regenerating section content
        const { instructions, tone, length } = regenerateRequest;
        let newContent = section.content;
        let wordCount = section.wordCount || 300;
        // Adjust length if requested
        if (length === 'shorter') {
            wordCount = Math.floor(wordCount * 0.7);
        }
        else if (length === 'longer') {
            wordCount = Math.floor(wordCount * 1.3);
        }
        // Generate new content based on instructions
        // Mock generation since we're using different parameters now
        const toneText = tone || blogPost.writerProfile?.tone || 'professional';
        const instructionText = instructions ? `Following instructions: ${instructions}. ` : '';
        const contentTemplates = {
            introduction: `${instructionText}In today's rapidly evolving ${blogPost.company.industry} landscape, ${blogPost.contentTopic.title.toLowerCase()} has become a critical focus area. This section explores the fundamental aspects and strategic importance for modern businesses.`,
            'main-point': `${instructionText}The core principle of ${section.title} centers around delivering measurable value. Research indicates that companies implementing these strategies see significant improvements in key performance metrics.`,
            example: `${instructionText}Consider the case of a leading ${blogPost.company.industry} company that successfully implemented ${blogPost.contentTopic.title.toLowerCase()}. Their approach demonstrates the practical application of these concepts.`,
            conclusion: `${instructionText}As we've explored throughout this discussion, ${blogPost.contentTopic.title.toLowerCase()} represents a significant opportunity for growth and innovation. The key is to start with a clear strategy and measurable goals.`
        };
        let baseContent = contentTemplates[section.purpose.toLowerCase()] || contentTemplates['main-point'];
        if (toneText === 'casual') {
            baseContent = baseContent.replace(/companies/g, 'teams')
                .replace(/businesses/g, 'organizations')
                .replace(/significant/g, 'awesome');
        }
        const words = baseContent.split(' ');
        while (words.length < wordCount) {
            words.push(...'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'.split(' '));
        }
        newContent = words.slice(0, wordCount).join(' ');
        // Update section
        section.content = newContent;
        section.wordCount = newContent.split(' ').length;
        section.suggestions = [
            'Consider adding specific examples',
            'Include relevant statistics or data',
            'Add a compelling call-to-action'
        ];
        await this.sectionRepository.save(section);
        return {
            section: this.mapSectionToInterface(section),
            message: 'Section regenerated successfully'
        };
    }
    async deleteSection(blogPostId, sectionId, userId) {
        const blogPost = await this.blogPostRepository.findOne({
            where: { id: blogPostId, userId },
            relations: ['sections']
        });
        if (!blogPost) {
            throw new common_1.NotFoundException('Blog post not found');
        }
        const sectionIndex = blogPost.sections.findIndex(s => s.id === sectionId);
        if (sectionIndex === -1) {
            throw new common_1.NotFoundException('Section not found');
        }
        // Remove the section
        const [removedSection] = blogPost.sections.splice(sectionIndex, 1);
        // Reorder remaining sections
        blogPost.sections.forEach((section, index) => {
            section.order = index + 1;
        });
        // Update word count
        blogPost.wordCount = this.calculateWordCount(blogPost.sections);
        blogPost.estimatedReadTime = this.calculateReadTime(blogPost.sections);
        // Delete the section and save blog post
        await this.sectionRepository.remove(removedSection);
        await this.blogPostRepository.save(blogPost);
        return {
            success: true,
            message: 'Section deleted successfully'
        };
    }
    async approveBlogPost(blogPostId, approveRequest, userId) {
        const blogPost = await this.blogPostRepository.findOne({
            where: { id: blogPostId, userId },
            relations: ['sections', 'contentTopic', 'company', 'user', 'writerProfile']
        });
        if (!blogPost) {
            throw new common_1.NotFoundException('Blog post not found');
        }
        // Check if all sections are approved
        const allSectionsApproved = blogPost.sections.every(section => section.status === 'approved');
        if (!allSectionsApproved && approveRequest.status === 'approved') {
            throw new common_1.BadRequestException('All sections must be approved before approving the blog post');
        }
        // Update status
        blogPost.status = approveRequest.status;
        if (approveRequest.status === 'published') {
            blogPost.publishedAt = new Date();
        }
        await this.blogPostRepository.save(blogPost);
        return this.mapToInterface(blogPost);
    }
};
exports.BlogPostsService = BlogPostsService;
exports.BlogPostsService = BlogPostsService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(blog_post_entity_1.BlogPost)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(blog_post_section_entity_1.BlogPostSection)),
    tslib_1.__param(2, (0, typeorm_1.InjectRepository)(content_topic_entity_1.ContentTopic)),
    tslib_1.__param(3, (0, typeorm_1.InjectRepository)(writer_profile_entity_1.WriterProfile)),
    tslib_1.__param(4, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _e : Object])
], BlogPostsService);


/***/ }),
/* 69 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PermissionGuard = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const rbac_service_1 = __webpack_require__(70);
const require_permission_decorator_1 = __webpack_require__(71);
let PermissionGuard = class PermissionGuard {
    constructor(reflector, rbacService) {
        this.reflector = reflector;
        this.rbacService = rbacService;
    }
    async canActivate(context) {
        const requiredPermission = this.reflector.getAllAndOverride(require_permission_decorator_1.PERMISSION_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredPermission) {
            return true; // No permission requirement
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        const hasPermission = await this.rbacService.canUserPerformAction({
            userId: user.id,
            action: requiredPermission.action,
            resource: requiredPermission.resource
        });
        if (!hasPermission) {
            throw new common_1.ForbiddenException(`Insufficient permissions. Required: ${requiredPermission.action}${requiredPermission.resource ? ` on ${requiredPermission.resource}` : ''}`);
        }
        return true;
    }
};
exports.PermissionGuard = PermissionGuard;
exports.PermissionGuard = PermissionGuard = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object, typeof (_b = typeof rbac_service_1.RBACService !== "undefined" && rbac_service_1.RBACService) === "function" ? _b : Object])
], PermissionGuard);


/***/ }),
/* 70 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RBACService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(12);
const user_entity_1 = __webpack_require__(14);
const company_entity_1 = __webpack_require__(24);
const shared_1 = __webpack_require__(15);
let RBACService = class RBACService {
    constructor(userRepository, companyRepository) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.systemPermissions = [
            // Content Management Permissions
            { id: 'content:create', action: 'content:create', resource: 'blog_posts', description: 'Create new content', category: 'content' },
            { id: 'content:read', action: 'content:read', resource: 'blog_posts', description: 'View content', category: 'content' },
            { id: 'content:update', action: 'content:update', resource: 'blog_posts', description: 'Edit existing content', category: 'content' },
            { id: 'content:delete', action: 'content:delete', resource: 'blog_posts', description: 'Delete content', category: 'content' },
            { id: 'content:approve', action: 'content:approve', resource: 'blog_posts', description: 'Approve content for publication', category: 'content' },
            { id: 'content:publish', action: 'content:publish', resource: 'blog_posts', description: 'Publish approved content', category: 'content' },
            { id: 'content:archive', action: 'content:archive', resource: 'blog_posts', description: 'Archive old content', category: 'content' },
            // Content Library Permissions
            { id: 'library:read', action: 'library:read', resource: 'content_library', description: 'View content library', category: 'management' },
            { id: 'library:manage', action: 'library:manage', resource: 'content_library', description: 'Manage content library assets', category: 'management' },
            { id: 'library:sync', action: 'library:sync', resource: 'content_library', description: 'Sync existing content to library', category: 'management' },
            // Writer Profiles Permissions
            { id: 'profiles:create', action: 'profiles:create', resource: 'writer_profiles', description: 'Create writer profiles', category: 'management' },
            { id: 'profiles:read', action: 'profiles:read', resource: 'writer_profiles', description: 'View writer profiles', category: 'management' },
            { id: 'profiles:update', action: 'profiles:update', resource: 'writer_profiles', description: 'Edit writer profiles', category: 'management' },
            { id: 'profiles:delete', action: 'profiles:delete', resource: 'writer_profiles', description: 'Delete writer profiles', category: 'management' },
            // Company Context Permissions
            { id: 'company:read', action: 'company:read', resource: 'company_context', description: 'View company information', category: 'management' },
            { id: 'company:update', action: 'company:update', resource: 'company_context', description: 'Update company context', category: 'management' },
            { id: 'company:manage', action: 'company:manage', resource: 'company_context', description: 'Full company management', category: 'management' },
            // Social Media Permissions
            { id: 'social:create', action: 'social:create', resource: 'social_posts', description: 'Create social media posts', category: 'content' },
            { id: 'social:read', action: 'social:read', resource: 'social_posts', description: 'View social media posts', category: 'content' },
            { id: 'social:update', action: 'social:update', resource: 'social_posts', description: 'Edit social media posts', category: 'content' },
            { id: 'social:delete', action: 'social:delete', resource: 'social_posts', description: 'Delete social media posts', category: 'content' },
            { id: 'social:approve', action: 'social:approve', resource: 'social_posts', description: 'Approve social media posts', category: 'content' },
            { id: 'social:publish', action: 'social:publish', resource: 'social_posts', description: 'Publish social media posts', category: 'content' },
            // Version Control Permissions
            { id: 'version:read', action: 'version:read', resource: 'blog_posts', description: 'View version history', category: 'collaboration' },
            { id: 'version:restore', action: 'version:restore', resource: 'blog_posts', description: 'Restore previous versions', category: 'collaboration' },
            { id: 'version:compare', action: 'version:compare', resource: 'blog_posts', description: 'Compare different versions', category: 'collaboration' },
            // Comments & Collaboration Permissions
            { id: 'comments:create', action: 'comments:create', resource: 'comments', description: 'Add comments to content', category: 'collaboration' },
            { id: 'comments:read', action: 'comments:read', resource: 'comments', description: 'View comments', category: 'collaboration' },
            { id: 'comments:update', action: 'comments:update', resource: 'comments', description: 'Edit own comments', category: 'collaboration' },
            { id: 'comments:delete', action: 'comments:delete', resource: 'comments', description: 'Delete comments', category: 'collaboration' },
            // User Management Permissions (Admin only)
            { id: 'users:read', action: 'users:read', resource: 'users', description: 'View user list', category: 'administration' },
            { id: 'users:create', action: 'users:create', resource: 'users', description: 'Create new users', category: 'administration' },
            { id: 'users:update', action: 'users:update', resource: 'users', description: 'Update user information', category: 'administration' },
            { id: 'users:delete', action: 'users:delete', resource: 'users', description: 'Delete users', category: 'administration' },
            { id: 'users:assign_roles', action: 'users:assign_roles', resource: 'users', description: 'Assign roles to users', category: 'administration' },
            // System Settings Permissions
            { id: 'system:read', action: 'system:read', resource: 'system', description: 'View system settings', category: 'administration' },
            { id: 'system:update', action: 'system:update', resource: 'system', description: 'Update system settings', category: 'administration' }
        ];
        this.systemRoles = [
            {
                id: 'admin',
                name: 'Admin',
                displayName: 'Administrator',
                description: 'Full access to all features and user management',
                permissions: shared_1.ROLE_PERMISSIONS.Admin,
                isSystem: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'editor',
                name: 'Editor',
                displayName: 'Content Editor',
                description: 'Create, edit, and manage content but cannot manage users',
                permissions: shared_1.ROLE_PERMISSIONS.Editor,
                isSystem: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'reviewer',
                name: 'Reviewer',
                displayName: 'Content Reviewer',
                description: 'Review and approve content but cannot create or edit',
                permissions: shared_1.ROLE_PERMISSIONS.Reviewer,
                isSystem: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'guest',
                name: 'Guest',
                displayName: 'Guest User',
                description: 'Read-only access to content and features',
                permissions: shared_1.ROLE_PERMISSIONS.Guest,
                isSystem: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
    }
    async canUserPerformAction(request) {
        const user = await this.userRepository.findOne({
            where: { id: request.userId },
            relations: ['company']
        });
        if (!user || !user.isActive) {
            return false;
        }
        // Get user's permissions (role-based + custom)
        const userPermissions = this.getUserPermissions(user);
        // Check if user has the required permission
        return userPermissions.includes(request.action);
    }
    async requirePermission(userId, action, resource) {
        const hasPermission = await this.canUserPerformAction({
            userId,
            action,
            resource
        });
        if (!hasPermission) {
            throw new common_1.ForbiddenException(`Insufficient permissions to perform action: ${action}`);
        }
    }
    async assignRole(request, adminUserId) {
        // Check if admin has permission to assign roles
        await this.requirePermission(adminUserId, 'users:assign_roles');
        const user = await this.userRepository.findOne({
            where: { id: request.userId }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        // Update user role and permissions
        user.role = request.role;
        user.permissions = request.customPermissions || shared_1.ROLE_PERMISSIONS[request.role];
        if (request.companyId) {
            // Verify company exists
            const company = await this.companyRepository.findOne({
                where: { id: request.companyId }
            });
            if (!company) {
                throw new common_1.NotFoundException('Company not found');
            }
            user.companyId = request.companyId;
        }
        await this.userRepository.save(user);
    }
    async updateUserPermissions(request, adminUserId) {
        // Check if admin has permission to update permissions
        await this.requirePermission(adminUserId, 'users:update');
        const user = await this.userRepository.findOne({
            where: { id: request.userId }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        // Validate permissions are valid for the user's role
        const allowedPermissions = shared_1.ROLE_PERMISSIONS[user.role];
        const invalidPermissions = request.permissions.filter(p => !allowedPermissions.includes(p));
        if (invalidPermissions.length > 0) {
            throw new common_1.ForbiddenException(`Invalid permissions for role ${user.role}: ${invalidPermissions.join(', ')}`);
        }
        user.permissions = request.permissions;
        await this.userRepository.save(user);
    }
    async getUserManagement(request, adminUserId) {
        // Check if admin has permission to read users
        await this.requirePermission(adminUserId, 'users:read');
        const page = request.page || 1;
        const limit = request.limit || 20;
        const offset = (page - 1) * limit;
        const queryBuilder = this.userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.company', 'company')
            .orderBy('user.createdAt', 'DESC');
        // Apply filters
        if (request.search) {
            queryBuilder.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
                search: `%${request.search}%`
            });
        }
        if (request.role) {
            queryBuilder.andWhere('user.role = :role', { role: request.role });
        }
        if (request.companyId) {
            queryBuilder.andWhere('user.companyId = :companyId', { companyId: request.companyId });
        }
        if (request.isActive !== undefined) {
            queryBuilder.andWhere('user.isActive = :isActive', { isActive: request.isActive });
        }
        const [users, totalCount] = await queryBuilder
            .limit(limit)
            .offset(offset)
            .getManyAndCount();
        return {
            users: users.map(user => this.mapUserToInterface(user)),
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        };
    }
    async getRoles() {
        return this.systemRoles;
    }
    async getPermissions() {
        return this.systemPermissions;
    }
    async getRolePermissions(roleName) {
        const rolePermissions = shared_1.ROLE_PERMISSIONS[roleName];
        return this.systemPermissions.filter(p => rolePermissions.includes(p.action));
    }
    async updateUserLastLogin(userId) {
        await this.userRepository.update(userId, {
            lastLoginAt: new Date()
        });
    }
    async deactivateUser(userId, adminUserId) {
        await this.requirePermission(adminUserId, 'users:update');
        await this.userRepository.update(userId, {
            isActive: false
        });
    }
    async activateUser(userId, adminUserId) {
        await this.requirePermission(adminUserId, 'users:update');
        await this.userRepository.update(userId, {
            isActive: true
        });
    }
    // Helper methods
    getUserPermissions(user) {
        // Start with role-based permissions
        const rolePermissions = shared_1.ROLE_PERMISSIONS[user.role] || [];
        // Add any custom permissions
        const customPermissions = user.permissions || [];
        // Merge and deduplicate
        return Array.from(new Set([...rolePermissions, ...customPermissions]));
    }
    mapUserToInterface(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: this.getUserPermissions(user),
            lastLoginAt: user.lastLoginAt,
            isActive: user.isActive,
            companyId: user.companyId,
            company: user.company ? {
                id: user.company.id,
                name: user.company.name
            } : undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
};
exports.RBACService = RBACService;
exports.RBACService = RBACService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], RBACService);


/***/ }),
/* 71 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RequirePermission = exports.PERMISSION_KEY = void 0;
const common_1 = __webpack_require__(1);
exports.PERMISSION_KEY = 'permissions';
const RequirePermission = (action, resource) => (0, common_1.SetMetadata)(exports.PERMISSION_KEY, { action, resource });
exports.RequirePermission = RequirePermission;


/***/ }),
/* 72 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegenerateBlogPostSectionRequestDto = exports.UpdateBlogPostSectionRequestDto = exports.GenerateBlogPostRequestDto = void 0;
const tslib_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(27);
class GenerateBlogPostRequestDto {
}
exports.GenerateBlogPostRequestDto = GenerateBlogPostRequestDto;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], GenerateBlogPostRequestDto.prototype, "contentTopicId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], GenerateBlogPostRequestDto.prototype, "writerProfileId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], GenerateBlogPostRequestDto.prototype, "additionalInstructions", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(500),
    (0, class_validator_1.Max)(10000),
    tslib_1.__metadata("design:type", Number)
], GenerateBlogPostRequestDto.prototype, "targetWordCount", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Boolean)
], GenerateBlogPostRequestDto.prototype, "includeOutline", void 0);
class UpdateBlogPostSectionRequestDto {
}
exports.UpdateBlogPostSectionRequestDto = UpdateBlogPostSectionRequestDto;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], UpdateBlogPostSectionRequestDto.prototype, "sectionId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateBlogPostSectionRequestDto.prototype, "title", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateBlogPostSectionRequestDto.prototype, "content", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateBlogPostSectionRequestDto.prototype, "purpose", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['pending', 'approved', 'needs_revision']),
    tslib_1.__metadata("design:type", String)
], UpdateBlogPostSectionRequestDto.prototype, "status", void 0);
class RegenerateBlogPostSectionRequestDto {
}
exports.RegenerateBlogPostSectionRequestDto = RegenerateBlogPostSectionRequestDto;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], RegenerateBlogPostSectionRequestDto.prototype, "sectionId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], RegenerateBlogPostSectionRequestDto.prototype, "instructions", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], RegenerateBlogPostSectionRequestDto.prototype, "tone", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['shorter', 'longer', 'same']),
    tslib_1.__metadata("design:type", String)
], RegenerateBlogPostSectionRequestDto.prototype, "length", void 0);


/***/ }),
/* 73 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VersionControlModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const version_control_service_1 = __webpack_require__(74);
const version_control_controller_1 = __webpack_require__(76);
const content_version_entity_1 = __webpack_require__(47);
const content_revision_entity_1 = __webpack_require__(48);
const blog_post_entity_1 = __webpack_require__(38);
const blog_post_section_entity_1 = __webpack_require__(39);
const social_media_post_entity_1 = __webpack_require__(40);
const reusable_snippet_entity_1 = __webpack_require__(45);
const user_entity_1 = __webpack_require__(14);
let VersionControlModule = class VersionControlModule {
};
exports.VersionControlModule = VersionControlModule;
exports.VersionControlModule = VersionControlModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                content_version_entity_1.ContentVersion,
                content_revision_entity_1.ContentRevision,
                blog_post_entity_1.BlogPost,
                blog_post_section_entity_1.BlogPostSection,
                social_media_post_entity_1.SocialMediaPost,
                reusable_snippet_entity_1.ReusableSnippet,
                user_entity_1.User
            ])
        ],
        controllers: [version_control_controller_1.VersionControlController],
        providers: [version_control_service_1.VersionControlService],
        exports: [version_control_service_1.VersionControlService]
    })
], VersionControlModule);


/***/ }),
/* 74 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VersionControlService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(12);
const content_version_entity_1 = __webpack_require__(47);
const content_revision_entity_1 = __webpack_require__(48);
const blog_post_entity_1 = __webpack_require__(38);
const blog_post_section_entity_1 = __webpack_require__(39);
const social_media_post_entity_1 = __webpack_require__(40);
const reusable_snippet_entity_1 = __webpack_require__(45);
const user_entity_1 = __webpack_require__(14);
const diff = tslib_1.__importStar(__webpack_require__(75));
let VersionControlService = class VersionControlService {
    constructor(contentVersionRepository, contentRevisionRepository, blogPostRepository, blogPostSectionRepository, socialMediaPostRepository, reusableSnippetRepository, userRepository, dataSource) {
        this.contentVersionRepository = contentVersionRepository;
        this.contentRevisionRepository = contentRevisionRepository;
        this.blogPostRepository = blogPostRepository;
        this.blogPostSectionRepository = blogPostSectionRepository;
        this.socialMediaPostRepository = socialMediaPostRepository;
        this.reusableSnippetRepository = reusableSnippetRepository;
        this.userRepository = userRepository;
        this.dataSource = dataSource;
    }
    async trackChange(entityType, entityId, changeType, changeSource, userId, contentSnapshot, changeDescription, previousContent) {
        // Get the latest version number
        const latestVersion = await this.contentVersionRepository.findOne({
            where: { entityType, entityId },
            order: { versionNumber: 'DESC' }
        });
        const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
        // Create content diff if previous content exists
        let contentDiff = null;
        if (previousContent) {
            contentDiff = this.createContentDiff(previousContent, contentSnapshot);
        }
        // Create new version
        const version = this.contentVersionRepository.create({
            entityType,
            entityId,
            versionNumber,
            changeType,
            changeSource,
            changedBy: userId,
            changeDescription,
            contentSnapshot,
            contentDiff,
            previousVersionId: latestVersion?.id
        });
        const savedVersion = await this.contentVersionRepository.save(version);
        // Update previous version's nextVersionId
        if (latestVersion) {
            await this.contentVersionRepository.update(latestVersion.id, { nextVersionId: savedVersion.id });
        }
        return savedVersion;
    }
    async trackRevision(entityType, entityId, changeType, changeSource, userId, previousContent, newContent, changeNotes, sectionId, paragraphIndex, aiPrompt, aiModel) {
        // Get version numbers
        const fromVersion = await this.getLatestVersionNumber(entityType, entityId) - 1;
        const toVersion = fromVersion + 1;
        const contentDiff = this.createTextDiff(previousContent, newContent);
        const revision = this.contentRevisionRepository.create({
            blogPostId: entityType === 'blog_post' ? entityId : undefined,
            socialPostId: entityType === 'social_post' ? entityId : undefined,
            snippetId: entityType === 'snippet' ? entityId : undefined,
            sectionId,
            paragraphIndex,
            fromVersion: Math.max(1, fromVersion),
            toVersion,
            changeType,
            changeSource,
            changedBy: userId,
            previousContent,
            newContent,
            contentDiff,
            changeNotes,
            aiPrompt,
            aiModel
        });
        return await this.contentRevisionRepository.save(revision);
    }
    async getContentHistory(request) {
        const { entityType, entityId, sectionId, paragraphIndex, filters, pagination } = request;
        // Build version query
        const versionQuery = this.contentVersionRepository
            .createQueryBuilder('version')
            .leftJoinAndSelect('version.user', 'user')
            .where('version.entityType = :entityType', { entityType })
            .andWhere('version.entityId = :entityId', { entityId })
            .orderBy('version.versionNumber', 'DESC');
        // Build revision query
        const revisionQuery = this.contentRevisionRepository
            .createQueryBuilder('revision')
            .leftJoinAndSelect('revision.user', 'user');
        // Apply entity-specific filters
        if (entityType === 'blog_post') {
            revisionQuery.andWhere('revision.blogPostId = :entityId', { entityId });
            if (sectionId) {
                revisionQuery.andWhere('revision.sectionId = :sectionId', { sectionId });
            }
            if (paragraphIndex !== undefined) {
                revisionQuery.andWhere('revision.paragraphIndex = :paragraphIndex', { paragraphIndex });
            }
        }
        else if (entityType === 'social_post') {
            revisionQuery.andWhere('revision.socialPostId = :entityId', { entityId });
        }
        else if (entityType === 'snippet') {
            revisionQuery.andWhere('revision.snippetId = :entityId', { entityId });
        }
        // Apply filters
        if (filters?.changeSource?.length) {
            versionQuery.andWhere('version.changeSource IN (:...sources)', { sources: filters.changeSource });
            revisionQuery.andWhere('revision.changeSource IN (:...sources)', { sources: filters.changeSource });
        }
        if (filters?.changedBy?.length) {
            versionQuery.andWhere('version.changedBy IN (:...users)', { users: filters.changedBy });
            revisionQuery.andWhere('revision.changedBy IN (:...users)', { users: filters.changedBy });
        }
        if (filters?.dateRange) {
            versionQuery.andWhere('version.changedAt BETWEEN :from AND :to', {
                from: filters.dateRange.from,
                to: filters.dateRange.to
            });
            revisionQuery.andWhere('revision.changedAt BETWEEN :from AND :to', {
                from: filters.dateRange.from,
                to: filters.dateRange.to
            });
        }
        revisionQuery.orderBy('revision.changedAt', 'DESC');
        // Apply pagination
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 20;
        const offset = (page - 1) * limit;
        versionQuery.limit(limit).offset(offset);
        revisionQuery.limit(limit).offset(offset);
        const [versions, versionsCount] = await versionQuery.getManyAndCount();
        const [revisions, revisionsCount] = await revisionQuery.getManyAndCount();
        // Get entity title
        const entityTitle = await this.getEntityTitle(entityType, entityId);
        // Calculate summary stats
        const summary = await this.calculateHistorySummary(entityType, entityId);
        return {
            entityType,
            entityId,
            entityTitle,
            versions: versions.map(v => this.mapVersionToInterface(v)),
            revisions: revisions.map(r => this.mapRevisionToInterface(r)),
            totalVersions: versionsCount,
            totalPages: Math.ceil(versionsCount / limit),
            currentPage: page,
            summary
        };
    }
    async compareVersions(request) {
        const { entityType, entityId, fromVersion, toVersion } = request;
        // Get the versions
        const fromVersionEntity = await this.contentVersionRepository.findOne({
            where: { entityType, entityId, versionNumber: fromVersion },
            relations: ['user']
        });
        const toVersionEntity = await this.contentVersionRepository.findOne({
            where: { entityType, entityId, versionNumber: toVersion },
            relations: ['user']
        });
        if (!fromVersionEntity || !toVersionEntity) {
            throw new common_1.NotFoundException('One or both versions not found');
        }
        // Get entity title
        const entityTitle = await this.getEntityTitle(entityType, entityId);
        // Calculate diff
        const diffResult = this.calculateVersionDiff(fromVersionEntity.contentSnapshot, toVersionEntity.contentSnapshot);
        // Calculate summary
        const summary = await this.calculateComparisonSummary(entityType, entityId, fromVersion, toVersion);
        return {
            entityType,
            entityId,
            entityTitle,
            fromVersion: this.mapVersionToInterface(fromVersionEntity),
            toVersion: this.mapVersionToInterface(toVersionEntity),
            additions: diffResult.additions,
            deletions: diffResult.deletions,
            modifications: diffResult.modifications,
            diff: diffResult.diff,
            summary
        };
    }
    async restoreVersion(request, userId) {
        const { entityType, entityId, targetVersion, restoreNotes } = request;
        // Get the target version
        const versionToRestore = await this.contentVersionRepository.findOne({
            where: { entityType, entityId, versionNumber: targetVersion }
        });
        if (!versionToRestore) {
            throw new common_1.NotFoundException('Version not found');
        }
        // Get current content
        const currentContent = await this.getCurrentContent(entityType, entityId);
        // Start transaction
        await this.dataSource.manager.transaction(async (transactionalEntityManager) => {
            // Update the entity with the restored content
            await this.updateEntity(entityType, entityId, versionToRestore.contentSnapshot, transactionalEntityManager);
            // Track the restore as a new version
            await this.trackChange(entityType, entityId, 'restore', 'human_edit', userId, versionToRestore.contentSnapshot, `Restored to version ${targetVersion}. ${restoreNotes || ''}`, currentContent);
            // Create a revision record
            if (currentContent && typeof currentContent === 'object' && 'content' in currentContent) {
                await this.trackRevision(entityType, entityId, 'restore', 'human_edit', userId, JSON.stringify(currentContent), JSON.stringify(versionToRestore.contentSnapshot), `Restored to version ${targetVersion}. ${restoreNotes || ''}`);
            }
        });
    }
    // Helper methods
    async getLatestVersionNumber(entityType, entityId) {
        const latest = await this.contentVersionRepository.findOne({
            where: { entityType, entityId },
            order: { versionNumber: 'DESC' }
        });
        return latest ? latest.versionNumber : 0;
    }
    async getEntityTitle(entityType, entityId) {
        switch (entityType) {
            case 'blog_post':
                const blogPost = await this.blogPostRepository.findOne({
                    where: { id: entityId }
                });
                return blogPost?.title || 'Unknown Blog Post';
            case 'social_post':
                const socialPost = await this.socialMediaPostRepository.findOne({
                    where: { id: entityId }
                });
                return socialPost ? `${socialPost.platform} Post` : 'Unknown Social Post';
            case 'snippet':
                const snippet = await this.reusableSnippetRepository.findOne({
                    where: { id: entityId }
                });
                return snippet?.title || 'Unknown Snippet';
            default:
                return 'Unknown Content';
        }
    }
    async getCurrentContent(entityType, entityId) {
        switch (entityType) {
            case 'blog_post':
                return await this.blogPostRepository.findOne({
                    where: { id: entityId },
                    relations: ['sections']
                });
            case 'social_post':
                return await this.socialMediaPostRepository.findOne({
                    where: { id: entityId }
                });
            case 'snippet':
                return await this.reusableSnippetRepository.findOne({
                    where: { id: entityId }
                });
            default:
                return null;
        }
    }
    async updateEntity(entityType, entityId, contentSnapshot, transactionalEntityManager) {
        switch (entityType) {
            case 'blog_post':
                await transactionalEntityManager.update(blog_post_entity_1.BlogPost, entityId, contentSnapshot);
                break;
            case 'social_post':
                await transactionalEntityManager.update(social_media_post_entity_1.SocialMediaPost, entityId, contentSnapshot);
                break;
            case 'snippet':
                await transactionalEntityManager.update(reusable_snippet_entity_1.ReusableSnippet, entityId, contentSnapshot);
                break;
        }
    }
    createContentDiff(oldContent, newContent) {
        // Simple JSON diff - in production, use a proper diff library
        const changes = [];
        // Compare top-level fields
        for (const key in newContent) {
            if (oldContent[key] !== newContent[key]) {
                changes.push({
                    field: key,
                    oldValue: oldContent[key],
                    newValue: newContent[key]
                });
            }
        }
        return changes;
    }
    createTextDiff(oldText, newText) {
        const changes = diff.diffLines(oldText, newText);
        return {
            changes: changes.map(change => ({
                value: change.value,
                added: change.added,
                removed: change.removed,
                count: change.count
            }))
        };
    }
    calculateVersionDiff(oldContent, newContent) {
        const additions = 0;
        const deletions = 0;
        const modifications = 0;
        const diffItems = [];
        // Implement proper diff calculation
        // This is a simplified version
        for (const key in newContent) {
            if (!(key in oldContent)) {
                diffItems.push({
                    type: 'added',
                    field: key,
                    newValue: newContent[key]
                });
            }
            else if (oldContent[key] !== newContent[key]) {
                diffItems.push({
                    type: 'modified',
                    field: key,
                    oldValue: oldContent[key],
                    newValue: newContent[key]
                });
            }
        }
        for (const key in oldContent) {
            if (!(key in newContent)) {
                diffItems.push({
                    type: 'removed',
                    field: key,
                    oldValue: oldContent[key]
                });
            }
        }
        return {
            additions: diffItems.filter(d => d.type === 'added').length,
            deletions: diffItems.filter(d => d.type === 'removed').length,
            modifications: diffItems.filter(d => d.type === 'modified').length,
            diff: diffItems
        };
    }
    async calculateHistorySummary(entityType, entityId) {
        const versions = await this.contentVersionRepository.find({
            where: { entityType, entityId },
            relations: ['user'],
            order: { changedAt: 'ASC' }
        });
        const aiChanges = versions.filter(v => v.changeSource === 'ai_generated').length;
        const humanChanges = versions.filter(v => v.changeSource === 'human_edit').length;
        // Group by user
        const userChanges = new Map();
        for (const version of versions) {
            const userId = version.changedBy;
            if (!userChanges.has(userId)) {
                userChanges.set(userId, {
                    userId,
                    userName: version.user?.name || 'Unknown User',
                    changeCount: 0,
                    lastChange: version.changedAt
                });
            }
            const userData = userChanges.get(userId);
            userData.changeCount++;
            userData.lastChange = version.changedAt;
        }
        return {
            firstVersion: versions[0]?.changedAt || new Date(),
            lastModified: versions[versions.length - 1]?.changedAt || new Date(),
            totalChanges: versions.length,
            aiChanges,
            humanChanges,
            contributors: Array.from(userChanges.values())
        };
    }
    async calculateComparisonSummary(entityType, entityId, fromVersion, toVersion) {
        const versions = await this.contentVersionRepository
            .createQueryBuilder('version')
            .where('version.entityType = :entityType', { entityType })
            .andWhere('version.entityId = :entityId', { entityId })
            .andWhere('version.versionNumber >= :fromVersion', { fromVersion })
            .andWhere('version.versionNumber <= :toVersion', { toVersion })
            .getMany();
        const changesBySource = {
            ai_generated: 0,
            human_edit: 0,
            system: 0,
            import: 0
        };
        const changesByUser = {};
        for (const version of versions) {
            changesBySource[version.changeSource]++;
            changesByUser[version.changedBy] = (changesByUser[version.changedBy] || 0) + 1;
        }
        return {
            totalChanges: versions.length,
            changesBySource,
            changesByUser
        };
    }
    mapVersionToInterface(version) {
        return {
            id: version.id,
            entityType: version.entityType,
            entityId: version.entityId,
            versionNumber: version.versionNumber,
            changeType: version.changeType,
            changeSource: version.changeSource,
            changedBy: version.changedBy,
            changedAt: version.changedAt,
            changeDescription: version.changeDescription,
            contentSnapshot: version.contentSnapshot,
            contentDiff: version.contentDiff,
            previousVersionId: version.previousVersionId,
            nextVersionId: version.nextVersionId,
            tags: version.tags,
            metadata: version.metadata
        };
    }
    mapRevisionToInterface(revision) {
        return {
            id: revision.id,
            blogPostId: revision.blogPostId,
            socialPostId: revision.socialPostId,
            snippetId: revision.snippetId,
            sectionId: revision.sectionId,
            paragraphIndex: revision.paragraphIndex,
            fromVersion: revision.fromVersion,
            toVersion: revision.toVersion,
            changeType: revision.changeType,
            changeSource: revision.changeSource,
            changedBy: revision.changedBy,
            changedAt: revision.changedAt,
            previousContent: revision.previousContent,
            newContent: revision.newContent,
            contentDiff: revision.contentDiff,
            changeNotes: revision.changeNotes,
            aiPrompt: revision.aiPrompt,
            aiModel: revision.aiModel
        };
    }
};
exports.VersionControlService = VersionControlService;
exports.VersionControlService = VersionControlService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(content_version_entity_1.ContentVersion)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(content_revision_entity_1.ContentRevision)),
    tslib_1.__param(2, (0, typeorm_1.InjectRepository)(blog_post_entity_1.BlogPost)),
    tslib_1.__param(3, (0, typeorm_1.InjectRepository)(blog_post_section_entity_1.BlogPostSection)),
    tslib_1.__param(4, (0, typeorm_1.InjectRepository)(social_media_post_entity_1.SocialMediaPost)),
    tslib_1.__param(5, (0, typeorm_1.InjectRepository)(reusable_snippet_entity_1.ReusableSnippet)),
    tslib_1.__param(6, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _e : Object, typeof (_f = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _f : Object, typeof (_g = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _g : Object, typeof (_h = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _h : Object])
], VersionControlService);


/***/ }),
/* 75 */
/***/ ((module) => {

module.exports = require("diff");

/***/ }),
/* 76 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VersionControlController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const version_control_service_1 = __webpack_require__(74);
const jwt_auth_guard_1 = __webpack_require__(28);
const shared_1 = __webpack_require__(15);
let VersionControlController = class VersionControlController {
    constructor(versionControlService) {
        this.versionControlService = versionControlService;
    }
    async getContentHistory(request) {
        return this.versionControlService.getContentHistory(request);
    }
    async compareVersions(request) {
        return this.versionControlService.compareVersions(request);
    }
    async restoreVersion(request, req) {
        await this.versionControlService.restoreVersion(request, req.user.id);
        return { message: 'Version restored successfully' };
    }
};
exports.VersionControlController = VersionControlController;
tslib_1.__decorate([
    (0, common_1.Post)('history'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof shared_1.ContentHistoryRequest !== "undefined" && shared_1.ContentHistoryRequest) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], VersionControlController.prototype, "getContentHistory", null);
tslib_1.__decorate([
    (0, common_1.Post)('compare'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_d = typeof shared_1.VersionComparisonRequest !== "undefined" && shared_1.VersionComparisonRequest) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], VersionControlController.prototype, "compareVersions", null);
tslib_1.__decorate([
    (0, common_1.Post)('restore'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_f = typeof shared_1.RestoreVersionRequest !== "undefined" && shared_1.RestoreVersionRequest) === "function" ? _f : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], VersionControlController.prototype, "restoreVersion", null);
exports.VersionControlController = VersionControlController = tslib_1.__decorate([
    (0, common_1.Controller)('version-control'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof version_control_service_1.VersionControlService !== "undefined" && version_control_service_1.VersionControlService) === "function" ? _a : Object])
], VersionControlController);


/***/ }),
/* 77 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RBACModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const rbac_service_1 = __webpack_require__(70);
const rbac_controller_1 = __webpack_require__(78);
const user_entity_1 = __webpack_require__(14);
const company_entity_1 = __webpack_require__(24);
let RBACModule = class RBACModule {
};
exports.RBACModule = RBACModule;
exports.RBACModule = RBACModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, company_entity_1.Company])
        ],
        controllers: [rbac_controller_1.RBACController],
        providers: [rbac_service_1.RBACService],
        exports: [rbac_service_1.RBACService]
    })
], RBACModule);


/***/ }),
/* 78 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RBACController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const rbac_service_1 = __webpack_require__(70);
const jwt_auth_guard_1 = __webpack_require__(28);
const shared_1 = __webpack_require__(15);
let RBACController = class RBACController {
    constructor(rbacService) {
        this.rbacService = rbacService;
    }
    async checkPermission(request) {
        const hasPermission = await this.rbacService.canUserPerformAction(request);
        return { hasPermission };
    }
    async assignRole(request, req) {
        await this.rbacService.assignRole(request, req.user.id);
        return { message: 'Role assigned successfully' };
    }
    async updateUserPermissions(request, req) {
        await this.rbacService.updateUserPermissions(request, req.user.id);
        return { message: 'User permissions updated successfully' };
    }
    async getUserManagement(request, req) {
        return this.rbacService.getUserManagement(request, req.user.id);
    }
    async getRoles() {
        return this.rbacService.getRoles();
    }
    async getPermissions() {
        return this.rbacService.getPermissions();
    }
    async getRolePermissions(roleName) {
        return this.rbacService.getRolePermissions(roleName);
    }
    async deactivateUser(userId, req) {
        await this.rbacService.deactivateUser(userId, req.user.id);
        return { message: 'User deactivated successfully' };
    }
    async activateUser(userId, req) {
        await this.rbacService.activateUser(userId, req.user.id);
        return { message: 'User activated successfully' };
    }
};
exports.RBACController = RBACController;
tslib_1.__decorate([
    (0, common_1.Post)('check-permission'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof shared_1.CanUserPerformAction !== "undefined" && shared_1.CanUserPerformAction) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], RBACController.prototype, "checkPermission", null);
tslib_1.__decorate([
    (0, common_1.Post)('assign-role'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_d = typeof shared_1.AssignRoleRequest !== "undefined" && shared_1.AssignRoleRequest) === "function" ? _d : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], RBACController.prototype, "assignRole", null);
tslib_1.__decorate([
    (0, common_1.Put)('user-permissions'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_f = typeof shared_1.UpdateUserPermissionsRequest !== "undefined" && shared_1.UpdateUserPermissionsRequest) === "function" ? _f : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], RBACController.prototype, "updateUserPermissions", null);
tslib_1.__decorate([
    (0, common_1.Post)('users'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_h = typeof shared_1.UserManagementRequest !== "undefined" && shared_1.UserManagementRequest) === "function" ? _h : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], RBACController.prototype, "getUserManagement", null);
tslib_1.__decorate([
    (0, common_1.Get)('roles'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], RBACController.prototype, "getRoles", null);
tslib_1.__decorate([
    (0, common_1.Get)('permissions'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], RBACController.prototype, "getPermissions", null);
tslib_1.__decorate([
    (0, common_1.Get)('roles/:roleName/permissions'),
    tslib_1.__param(0, (0, common_1.Param)('roleName')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_m = typeof shared_1.UserRole !== "undefined" && shared_1.UserRole) === "function" ? _m : Object]),
    tslib_1.__metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], RBACController.prototype, "getRolePermissions", null);
tslib_1.__decorate([
    (0, common_1.Put)('users/:userId/deactivate'),
    tslib_1.__param(0, (0, common_1.Param)('userId')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], RBACController.prototype, "deactivateUser", null);
tslib_1.__decorate([
    (0, common_1.Put)('users/:userId/activate'),
    tslib_1.__param(0, (0, common_1.Param)('userId')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_q = typeof Promise !== "undefined" && Promise) === "function" ? _q : Object)
], RBACController.prototype, "activateUser", null);
exports.RBACController = RBACController = tslib_1.__decorate([
    (0, common_1.Controller)('rbac'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof rbac_service_1.RBACService !== "undefined" && rbac_service_1.RBACService) === "function" ? _a : Object])
], RBACController);


/***/ }),
/* 79 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SocialMediaModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const social_media_service_1 = __webpack_require__(80);
const social_media_controller_1 = __webpack_require__(81);
const export_service_1 = __webpack_require__(83);
const social_media_post_entity_1 = __webpack_require__(40);
const social_media_content_plan_entity_1 = __webpack_require__(41);
const blog_post_entity_1 = __webpack_require__(38);
const writer_profile_entity_1 = __webpack_require__(34);
const company_entity_1 = __webpack_require__(24);
let SocialMediaModule = class SocialMediaModule {
};
exports.SocialMediaModule = SocialMediaModule;
exports.SocialMediaModule = SocialMediaModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                social_media_post_entity_1.SocialMediaPost,
                social_media_content_plan_entity_1.SocialMediaContentPlan,
                blog_post_entity_1.BlogPost,
                writer_profile_entity_1.WriterProfile,
                company_entity_1.Company
            ])
        ],
        controllers: [social_media_controller_1.SocialMediaController],
        providers: [social_media_service_1.SocialMediaService, export_service_1.ExportService],
        exports: [social_media_service_1.SocialMediaService, export_service_1.ExportService]
    })
], SocialMediaModule);


/***/ }),
/* 80 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SocialMediaService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(12);
const social_media_post_entity_1 = __webpack_require__(40);
const social_media_content_plan_entity_1 = __webpack_require__(41);
const blog_post_entity_1 = __webpack_require__(38);
const writer_profile_entity_1 = __webpack_require__(34);
const company_entity_1 = __webpack_require__(24);
const shared_1 = __webpack_require__(15);
let SocialMediaService = class SocialMediaService {
    constructor(socialPostRepository, contentPlanRepository, blogPostRepository, writerProfileRepository, companyRepository) {
        this.socialPostRepository = socialPostRepository;
        this.contentPlanRepository = contentPlanRepository;
        this.blogPostRepository = blogPostRepository;
        this.writerProfileRepository = writerProfileRepository;
        this.companyRepository = companyRepository;
    }
    async generateSocialPosts(request, userId) {
        // Get the blog post with all relations
        const blogPost = await this.blogPostRepository.findOne({
            where: { id: request.blogPostId },
            relations: ['sections', 'contentTopic', 'company', 'user']
        });
        if (!blogPost) {
            throw new common_1.NotFoundException('Blog post not found');
        }
        if (blogPost.status !== 'approved' && blogPost.status !== 'published') {
            throw new common_1.BadRequestException('Blog post must be approved before generating social posts');
        }
        // Get writer profiles if specified, otherwise use the blog post's writer profile
        let writerProfiles = [];
        if (request.writerProfileIds && request.writerProfileIds.length > 0) {
            writerProfiles = await this.writerProfileRepository.findByIds(request.writerProfileIds);
        }
        else if (blogPost.writerProfileId) {
            const profile = await this.writerProfileRepository.findOne({
                where: { id: blogPost.writerProfileId }
            });
            if (profile)
                writerProfiles = [profile];
        }
        if (writerProfiles.length === 0) {
            throw new common_1.BadRequestException('At least one writer profile is required');
        }
        // Extract insights from the blog post
        const insights = this.extractInsightsFromBlogPost(blogPost);
        // Create content plan
        const contentPlan = this.contentPlanRepository.create({
            blogPostId: blogPost.id,
            companyId: blogPost.companyId,
            userId,
            selectedPlatforms: request.platforms,
            selectedWriterProfiles: writerProfiles.map(p => p.id),
            publishingFrequency: 'weekly',
            status: 'draft',
            posts: []
        });
        await this.contentPlanRepository.save(contentPlan);
        // Generate posts for each platform and writer profile combination
        const posts = [];
        const postsPerPlatform = request.postsPerPlatform || 3;
        for (const platform of request.platforms) {
            for (const writerProfile of writerProfiles) {
                const platformPosts = await this.generatePostsForPlatform(blogPost, platform, writerProfile, contentPlan, insights, postsPerPlatform, request.includeVisuals || false);
                posts.push(...platformPosts);
            }
        }
        // Save all posts
        await this.socialPostRepository.save(posts);
        // Update content plan with posts
        contentPlan.posts = posts;
        await this.contentPlanRepository.save(contentPlan);
        return {
            contentPlan: this.mapContentPlanToInterface(contentPlan),
            posts: posts.map(p => this.mapPostToInterface(p)),
            insights
        };
    }
    extractInsightsFromBlogPost(blogPost) {
        const keyTakeaways = [];
        const quotableSegments = [];
        const angleVariations = [];
        // Extract key takeaways from sections
        blogPost.sections.forEach(section => {
            // Look for sections with specific purposes
            if (section.purpose.toLowerCase().includes('takeaway') ||
                section.purpose.toLowerCase().includes('conclusion')) {
                keyTakeaways.push(this.extractFirstSentence(section.content));
            }
            // Extract quotable segments (sentences with strong statements)
            const sentences = section.content.split(/[.!?]+/);
            sentences.forEach(sentence => {
                if (sentence.length > 50 && sentence.length < 200) {
                    if (sentence.includes('essential') || sentence.includes('critical') ||
                        sentence.includes('important') || sentence.includes('must')) {
                        quotableSegments.push(sentence.trim());
                    }
                }
            });
        });
        // Generate angle variations based on content
        const topicTitle = blogPost.contentTopic?.title || blogPost.title;
        angleVariations.push(`Technical deep-dive into ${topicTitle}`, `The emotional impact of ${topicTitle}`, `Breaking news: Latest developments in ${topicTitle}`, `Learn how ${topicTitle} can transform your business`, `Why ${topicTitle} matters more than ever`);
        return {
            keyTakeaways: keyTakeaways.slice(0, 5),
            quotableSegments: quotableSegments.slice(0, 5),
            angleVariations
        };
    }
    async generatePostsForPlatform(blogPost, platform, writerProfile, contentPlan, insights, count, includeVisuals) {
        const posts = [];
        const angles = ['technical', 'emotional', 'educational'];
        for (let i = 0; i < Math.min(count, angles.length); i++) {
            const angle = angles[i];
            const content = this.generatePostContent(blogPost, platform, writerProfile, angle, insights, i);
            const hashtags = this.generateHashtags(blogPost, platform);
            const emojis = this.generateEmojis(platform, angle);
            const visualConcepts = includeVisuals ? this.generateVisualConcepts(platform, blogPost, angle) : undefined;
            const post = this.socialPostRepository.create({
                blogPostId: blogPost.id,
                contentPlanId: contentPlan.id,
                platform,
                writerProfileId: writerProfile.id,
                content,
                hashtags,
                emojis,
                callToAction: this.generateCTA(platform, angle),
                characterCount: content.length,
                mediaType: this.determineMediaType(platform, includeVisuals),
                visualConcepts,
                angle,
                status: 'draft'
            });
            posts.push(post);
        }
        return posts;
    }
    generatePostContent(blogPost, platform, writerProfile, angle, insights, index) {
        const maxChars = shared_1.PLATFORM_CONSTRAINTS[platform].maxChars;
        let content = '';
        // Start with an attention-grabbing opener based on angle
        const openers = {
            technical: `🔬 Deep dive: ${blogPost.title}`,
            emotional: `💡 This changed everything for us...`,
            news: `📢 Breaking: New insights on ${blogPost.contentTopic?.title || blogPost.title}`,
            educational: `📚 Learn something new today:`,
            inspirational: `✨ Your next breakthrough starts here:`
        };
        content = openers[angle] + '\n\n';
        // Add main content based on available insights
        if (insights.keyTakeaways[index]) {
            content += insights.keyTakeaways[index] + '\n\n';
        }
        else if (insights.quotableSegments[index]) {
            content += `"${insights.quotableSegments[index]}"\n\n`;
        }
        else {
            content += this.extractFirstSentence(blogPost.excerpt) + '\n\n';
        }
        // Add writer's perspective
        if (writerProfile.tone === 'Professional') {
            content += `As ${writerProfile.position}, I've seen firsthand how this impacts our industry.\n\n`;
        }
        else if (writerProfile.tone === 'Casual') {
            content += `Here's what we learned (spoiler: it's game-changing!):\n\n`;
        }
        // Trim to platform limits
        if (content.length > maxChars - 50) { // Leave room for hashtags
            content = content.substring(0, maxChars - 50) + '...';
        }
        return content.trim();
    }
    generateHashtags(blogPost, platform) {
        const hashtags = [];
        // Add topic-based hashtags
        const topicTitle = blogPost.contentTopic?.title || blogPost.title;
        const topicWords = topicTitle.split(' ')
            .filter(word => word.length > 3)
            .map(word => '#' + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
        hashtags.push(...topicWords.slice(0, 2));
        // Add category-based hashtag  
        if (blogPost.contentTopic && blogPost.contentTopic.category && blogPost.contentTopic.category.name) {
            hashtags.push('#' + blogPost.contentTopic.category.name.replace(/\s+/g, ''));
        }
        // Add platform-specific trending hashtags
        const platformHashtags = {
            linkedin: ['#BusinessGrowth', '#Innovation', '#Leadership'],
            twitter: ['#TechTwitter', '#StartupLife', '#Innovation'],
            instagram: ['#BusinessTips', '#EntrepreneurLife', '#SuccessMindset'],
            facebook: ['#SmallBusiness', '#BusinessOwner', '#GrowYourBusiness'],
            tiktok: ['#BusinessTok', '#CareerAdvice', '#LearnOnTikTok'],
            youtube: ['#Shorts', '#BusinessTips', '#HowTo'],
            pinterest: ['#BusinessIdeas', '#MarketingTips', '#Success'],
            threads: ['#ThreadsForBusiness', '#BusinessCommunity'],
            reddit: [] // Reddit doesn't use hashtags
        };
        hashtags.push(...(platformHashtags[platform] || []).slice(0, 2));
        return hashtags.slice(0, 5); // Limit to 5 hashtags
    }
    generateEmojis(platform, angle) {
        const angleEmojis = {
            technical: ['🔬', '💻', '🔧', '📊', '🎯'],
            emotional: ['💡', '❤️', '🌟', '✨', '🙌'],
            news: ['📢', '🔥', '🚀', '📰', '⚡'],
            educational: ['📚', '🎓', '💭', '🧠', '📝'],
            inspirational: ['✨', '🌈', '💪', '🎯', '🚀']
        };
        return angleEmojis[angle] || ['👍', '💼', '📈'];
    }
    generateCTA(platform, angle) {
        const ctas = {
            linkedin: {
                technical: 'What technical challenges are you facing? Let\'s discuss in the comments.',
                emotional: 'Share your story below. We\'d love to hear your experience.',
                news: 'Follow us for more industry updates and insights.',
                educational: 'Save this post for future reference. What would you add?',
                inspirational: 'Tag someone who needs to see this today.'
            },
            twitter: {
                technical: 'RT if you found this helpful! 🔄',
                emotional: 'Quote tweet with your thoughts 💭',
                news: 'Follow for more updates 🔔',
                educational: 'Bookmark this thread 🔖',
                inspirational: 'Who else needs to see this? Tag them! 👇'
            },
            instagram: {
                technical: 'Double tap if you learned something new! Which tip was most helpful?',
                emotional: 'Save this for when you need it most ❤️',
                news: 'Share to your stories to spread the word!',
                educational: 'Which tip will you try first? Comment below!',
                inspirational: 'Tag a friend who needs this reminder today 🌟'
            }
        };
        return ctas[platform]?.[angle] || 'Learn more on our blog (link in bio)';
    }
    generateVisualConcepts(platform, blogPost, angle) {
        const concepts = [];
        const timestamp = Date.now();
        // 4.1: Carousel Content for Instagram and Pinterest
        if (platform === 'instagram' || platform === 'pinterest') {
            // Carousel concept
            concepts.push({
                id: `vc-${timestamp}-1`,
                type: 'carousel',
                description: `"Top 5 Insights from ${blogPost.title.substring(0, 30)}..." - Multi-slide carousel breaking down key takeaways`,
                aiPrompt: `Professional ${blogPost.company.industry} carousel design, clean layout, slide 1: title card with "${blogPost.title}", slides 2-6: key insights with icons, ${angle} aesthetic, branded colors`
            });
            // 4.2: AI Image Prompts
            const imagePrompts = this.generateAIImagePrompts(blogPost, angle);
            concepts.push({
                id: `vc-${timestamp}-2`,
                type: 'image',
                description: `Hero image concept: ${imagePrompts.heroDescription}`,
                aiPrompt: imagePrompts.heroPrompt
            });
            // 4.3: Visual Element Mockups - Quote Card
            concepts.push({
                id: `vc-${timestamp}-3`,
                type: 'quote_card',
                description: 'Branded quote card featuring key insight from the blog post',
                aiPrompt: `Minimalist quote card design, ${blogPost.company.industry} branding, professional typography, subtle background pattern, company logo placement`
            });
            // 4.3: Visual Element Mockups - Chart/Infographic
            if (this.shouldIncludeChart(blogPost)) {
                concepts.push({
                    id: `vc-${timestamp}-4`,
                    type: 'infographic',
                    description: 'Data visualization or process chart based on blog content',
                    aiPrompt: `Clean infographic design, ${angle} style, data visualization for ${blogPost.company.industry}, modern chart design with brand colors`
                });
            }
        }
        // 4.4: Video Script Snippets & 4.5: Visual Scene Ideas for TikTok and YouTube Shorts
        if (platform === 'tiktok' || platform === 'youtube') {
            const videoScripts = this.generateVideoScripts(blogPost, angle);
            // 15-second quick tip video
            concepts.push({
                id: `vc-${timestamp}-5`,
                type: 'video',
                description: '15-second quick tip derived from blog takeaways',
                sceneIdeas: [
                    `Hook: "${videoScripts.hook}" (2-3s)`,
                    `Main insight with text overlay (8-10s)`,
                    `Quick example or demonstration (3-4s)`,
                    `CTA: "Full article in bio" (1-2s)`
                ],
                duration: 15,
                script: videoScripts.quickTip
            });
            // 30-second detailed explainer
            concepts.push({
                id: `vc-${timestamp}-6`,
                type: 'video',
                description: '30-second explainer video with workspace B-roll',
                sceneIdeas: [
                    `Opening hook with surprising statistic (3-5s)`,
                    `Problem setup with voiceover + B-roll from workspace (8-10s)`,
                    `Solution explanation with text overlays (12-15s)`,
                    `Call to action with blog preview (3-5s)`
                ],
                duration: 30,
                script: videoScripts.detailed
            });
        }
        // 4.6: Visual Content CTAs - Add platform-specific CTAs to all concepts
        concepts.forEach(concept => {
            concept.suggestedCTAs = this.generateVisualCTAs(platform, concept.type);
        });
        return concepts;
    }
    generateAIImagePrompts(blogPost, angle) {
        const industryThemes = {
            'Technology': 'modern tech workspace, sleek devices, digital elements',
            'Healthcare': 'clean medical environment, health symbols, caring atmosphere',
            'Finance': 'professional office, financial charts, business setting',
            'Education': 'learning environment, books, collaborative space',
            'Retail': 'product display, customer interaction, shopping experience',
            'Manufacturing': 'industrial setting, production line, quality focus'
        };
        const angleThemes = {
            'technical': 'detailed, analytical, data-focused',
            'emotional': 'human-centered, warm lighting, personal connection',
            'news': 'dynamic, urgent, newsworthy presentation',
            'educational': 'clear, instructional, step-by-step visual',
            'inspirational': 'aspirational, bright, motivational energy'
        };
        const industryTheme = industryThemes[blogPost.company.industry] || 'professional business environment';
        const angleTheme = angleThemes[angle] || 'professional';
        return {
            heroDescription: `${industryTheme} with ${angleTheme} composition`,
            heroPrompt: `High-quality ${industryTheme}, ${angleTheme}, professional photography, ${blogPost.company.industry} industry, clean composition, brand-appropriate lighting`
        };
    }
    generateVideoScripts(blogPost, angle) {
        const hooks = {
            'technical': `Did you know ${blogPost.company.industry} companies that do this see 40% better results?`,
            'emotional': 'This one mistake cost us everything...',
            'news': `BREAKING: Major shift happening in ${blogPost.company.industry}`,
            'educational': `Learn this ${blogPost.company.industry} secret in 30 seconds`,
            'inspirational': 'What if I told you this could change your business forever?'
        };
        const hook = hooks[angle] || `Here's what you need to know about ${blogPost.title}`;
        return {
            hook,
            quickTip: `${hook}\n\nHere's the key insight from our latest research:\n[Main takeaway from blog]\n\nTry this approach and see the difference.\n\nRead the full breakdown in our latest article!`,
            detailed: `${hook}\n\n[Problem context - 8 seconds]\nMost companies struggle with this exact issue.\n\n[Solution explanation - 15 seconds] \nHere's the proven approach that works:\n[Key solution from blog post]\n\n[Call to action - 5 seconds]\nWant the complete strategy? Check out our full article linked in bio.`
        };
    }
    generateVisualCTAs(platform, conceptType) {
        const baseCTAs = [
            'Read the full story on our blog',
            'Follow us for more tips like this',
            'Share if this helped you',
            'Save this for later'
        ];
        const platformSpecific = {
            'instagram': ['Story highlights link in bio', 'Swipe for more insights', 'Double tap if you agree'],
            'pinterest': ['Pin this for later', 'Click through for full article', 'Save to your board'],
            'tiktok': ['Duet with your experience', 'Follow for more industry tips', 'Link in bio for details'],
            'youtube': ['Watch now', 'Subscribe for weekly insights', 'Comment your thoughts below'],
            'linkedin': ['Connect with me for more insights', 'Share with your network'],
            'twitter': ['Thread continues below', 'Retweet to share', 'Reply with your thoughts'],
            'facebook': ['Read more', 'Share with friends', 'React if this resonates']
        };
        const videoSpecific = conceptType === 'video' ?
            ['Watch now', 'Turn on notifications', 'Like and subscribe'] : [];
        return [
            ...baseCTAs,
            ...(platformSpecific[platform] || []),
            ...videoSpecific
        ].slice(0, 4); // Limit to 4 CTAs
    }
    shouldIncludeChart(blogPost) {
        // Simple heuristic: include charts for technical/educational content
        const chartKeywords = ['data', 'statistics', 'process', 'steps', 'comparison', 'results', 'analysis'];
        const content = `${blogPost.title} ${blogPost.excerpt}`.toLowerCase();
        return chartKeywords.some(keyword => content.includes(keyword));
    }
    determineMediaType(platform, includeVisuals) {
        if (!includeVisuals)
            return 'text';
        const constraints = shared_1.PLATFORM_CONSTRAINTS[platform];
        if (constraints.requiresVideo)
            return 'video';
        if (constraints.requiresImage || constraints.requiresMedia)
            return 'image';
        // Default media types for platforms
        if (platform === 'instagram' || platform === 'pinterest')
            return 'carousel';
        if (platform === 'tiktok' || platform === 'youtube')
            return 'video';
        return 'text';
    }
    extractFirstSentence(text) {
        const match = text.match(/^[^.!?]+[.!?]/);
        return match ? match[0].trim() : text.substring(0, 100) + '...';
    }
    async getContentPlans(companyId) {
        const query = this.contentPlanRepository
            .createQueryBuilder('plan')
            .leftJoinAndSelect('plan.posts', 'posts')
            .leftJoinAndSelect('plan.blogPost', 'blogPost')
            .leftJoinAndSelect('plan.company', 'company')
            .orderBy('plan.createdAt', 'DESC');
        if (companyId) {
            query.where('plan.companyId = :companyId', { companyId });
        }
        const plans = await query.getMany();
        return plans.map(plan => this.mapContentPlanToInterface(plan));
    }
    async getContentPlan(id) {
        const plan = await this.contentPlanRepository.findOne({
            where: { id },
            relations: ['posts', 'blogPost', 'company']
        });
        if (!plan) {
            throw new common_1.NotFoundException('Content plan not found');
        }
        return this.mapContentPlanToInterface(plan);
    }
    async updateSocialPost(postId, updateRequest, userId) {
        const post = await this.socialPostRepository.findOne({
            where: { id: postId },
            relations: ['contentPlan']
        });
        if (!post) {
            throw new common_1.NotFoundException('Social media post not found');
        }
        // Verify user has access
        if (post.contentPlan.userId !== userId) {
            throw new common_1.BadRequestException('Unauthorized to update this post');
        }
        // Update fields
        if (updateRequest.content !== undefined) {
            post.content = updateRequest.content;
            post.characterCount = updateRequest.content.length;
        }
        if (updateRequest.hashtags !== undefined)
            post.hashtags = updateRequest.hashtags;
        if (updateRequest.emojis !== undefined)
            post.emojis = updateRequest.emojis;
        if (updateRequest.callToAction !== undefined)
            post.callToAction = updateRequest.callToAction;
        if (updateRequest.visualConcepts !== undefined)
            post.visualConcepts = updateRequest.visualConcepts;
        if (updateRequest.status !== undefined)
            post.status = updateRequest.status;
        if (updateRequest.scheduledFor !== undefined)
            post.scheduledFor = updateRequest.scheduledFor;
        await this.socialPostRepository.save(post);
        return this.mapPostToInterface(post);
    }
    async regenerateSocialPost(postId, regenerateRequest, userId) {
        const post = await this.socialPostRepository.findOne({
            where: { id: postId },
            relations: ['contentPlan', 'blogPost', 'writerProfile']
        });
        if (!post) {
            throw new common_1.NotFoundException('Social media post not found');
        }
        // Regenerate content with new parameters
        const newAngle = regenerateRequest.angle || post.angle;
        const insights = this.extractInsightsFromBlogPost(post.blogPost);
        post.content = this.generatePostContent(post.blogPost, post.platform, post.writerProfile, newAngle, insights, 0);
        if (regenerateRequest.includeMoreEmojis) {
            post.emojis = [...post.emojis, ...this.generateEmojis(post.platform, newAngle)];
        }
        post.angle = newAngle;
        post.characterCount = post.content.length;
        await this.socialPostRepository.save(post);
        return this.mapPostToInterface(post);
    }
    async deleteSocialPost(postId, userId) {
        const post = await this.socialPostRepository.findOne({
            where: { id: postId },
            relations: ['contentPlan']
        });
        if (!post) {
            throw new common_1.NotFoundException('Social media post not found');
        }
        if (post.contentPlan.userId !== userId) {
            throw new common_1.BadRequestException('Unauthorized to delete this post');
        }
        await this.socialPostRepository.remove(post);
    }
    mapPostToInterface(post) {
        return {
            id: post.id,
            blogPostId: post.blogPostId,
            platform: post.platform,
            writerProfileId: post.writerProfileId,
            content: post.content,
            hashtags: post.hashtags,
            emojis: post.emojis,
            callToAction: post.callToAction,
            characterCount: post.characterCount,
            mediaType: post.mediaType,
            visualConcepts: post.visualConcepts,
            angle: post.angle,
            status: post.status,
            scheduledFor: post.scheduledFor,
            publishedAt: post.publishedAt,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        };
    }
    mapContentPlanToInterface(plan) {
        return {
            id: plan.id,
            blogPostId: plan.blogPostId,
            companyId: plan.companyId,
            userId: plan.userId,
            posts: plan.posts ? plan.posts.map(p => this.mapPostToInterface(p)) : [],
            selectedPlatforms: plan.selectedPlatforms,
            selectedWriterProfiles: plan.selectedWriterProfiles,
            publishingFrequency: plan.publishingFrequency,
            status: plan.status,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt
        };
    }
};
exports.SocialMediaService = SocialMediaService;
exports.SocialMediaService = SocialMediaService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(social_media_post_entity_1.SocialMediaPost)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(social_media_content_plan_entity_1.SocialMediaContentPlan)),
    tslib_1.__param(2, (0, typeorm_1.InjectRepository)(blog_post_entity_1.BlogPost)),
    tslib_1.__param(3, (0, typeorm_1.InjectRepository)(writer_profile_entity_1.WriterProfile)),
    tslib_1.__param(4, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _e : Object])
], SocialMediaService);


/***/ }),
/* 81 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SocialMediaController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const express_1 = __webpack_require__(82);
const social_media_service_1 = __webpack_require__(80);
const export_service_1 = __webpack_require__(83);
const jwt_auth_guard_1 = __webpack_require__(28);
const shared_1 = __webpack_require__(15);
let SocialMediaController = class SocialMediaController {
    constructor(socialMediaService, exportService) {
        this.socialMediaService = socialMediaService;
        this.exportService = exportService;
    }
    async generateSocialPosts(request, req) {
        return this.socialMediaService.generateSocialPosts(request, req.user.id);
    }
    async getContentPlans(companyId) {
        return this.socialMediaService.getContentPlans(companyId);
    }
    async getContentPlan(id) {
        return this.socialMediaService.getContentPlan(id);
    }
    async updateSocialPost(postId, updateRequest, req) {
        return this.socialMediaService.updateSocialPost(postId, updateRequest, req.user.id);
    }
    async regenerateSocialPost(postId, regenerateRequest, req) {
        return this.socialMediaService.regenerateSocialPost(postId, regenerateRequest, req.user.id);
    }
    async deleteSocialPost(postId, req) {
        return this.socialMediaService.deleteSocialPost(postId, req.user.id);
    }
    // Export endpoints for Story 4.3
    async exportContentPlanCSV(planId, req, res) {
        const data = await this.exportService.exportContentPlanData(planId, req.user.id);
        const csv = this.exportService.generateCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="content-plan-${planId}.csv"`);
        res.status(common_1.HttpStatus.OK).send(csv);
    }
    async exportContentPlanNotion(planId, req) {
        const data = await this.exportService.exportContentPlanData(planId, req.user.id);
        return this.exportService.generateNotionFormat(data);
    }
    async exportContentPlanBuffer(planId, req) {
        const data = await this.exportService.exportContentPlanData(planId, req.user.id);
        return this.exportService.generateBufferFormat(data);
    }
    async exportContentPlanHootsuite(planId, req) {
        const data = await this.exportService.exportContentPlanData(planId, req.user.id);
        return this.exportService.generateHootsuiteFormat(data);
    }
    async getContentPlanExportData(planId, req) {
        return this.exportService.exportContentPlanData(planId, req.user.id);
    }
};
exports.SocialMediaController = SocialMediaController;
tslib_1.__decorate([
    (0, common_1.Post)('generate'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof shared_1.GenerateSocialPostsRequest !== "undefined" && shared_1.GenerateSocialPostsRequest) === "function" ? _c : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], SocialMediaController.prototype, "generateSocialPosts", null);
tslib_1.__decorate([
    (0, common_1.Get)('content-plans'),
    tslib_1.__param(0, (0, common_1.Query)('companyId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], SocialMediaController.prototype, "getContentPlans", null);
tslib_1.__decorate([
    (0, common_1.Get)('content-plans/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], SocialMediaController.prototype, "getContentPlan", null);
tslib_1.__decorate([
    (0, common_1.Put)('posts/:postId'),
    tslib_1.__param(0, (0, common_1.Param)('postId')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_g = typeof shared_1.UpdateSocialPostRequest !== "undefined" && shared_1.UpdateSocialPostRequest) === "function" ? _g : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], SocialMediaController.prototype, "updateSocialPost", null);
tslib_1.__decorate([
    (0, common_1.Post)('posts/:postId/regenerate'),
    tslib_1.__param(0, (0, common_1.Param)('postId')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_j = typeof shared_1.RegenerateSocialPostRequest !== "undefined" && shared_1.RegenerateSocialPostRequest) === "function" ? _j : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], SocialMediaController.prototype, "regenerateSocialPost", null);
tslib_1.__decorate([
    (0, common_1.Delete)('posts/:postId'),
    tslib_1.__param(0, (0, common_1.Param)('postId')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], SocialMediaController.prototype, "deleteSocialPost", null);
tslib_1.__decorate([
    (0, common_1.Get)('content-plans/:id/export/csv'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__param(2, (0, common_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, typeof (_m = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _m : Object]),
    tslib_1.__metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], SocialMediaController.prototype, "exportContentPlanCSV", null);
tslib_1.__decorate([
    (0, common_1.Get)('content-plans/:id/export/notion'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], SocialMediaController.prototype, "exportContentPlanNotion", null);
tslib_1.__decorate([
    (0, common_1.Get)('content-plans/:id/export/buffer'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_q = typeof Promise !== "undefined" && Promise) === "function" ? _q : Object)
], SocialMediaController.prototype, "exportContentPlanBuffer", null);
tslib_1.__decorate([
    (0, common_1.Get)('content-plans/:id/export/hootsuite'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_r = typeof Promise !== "undefined" && Promise) === "function" ? _r : Object)
], SocialMediaController.prototype, "exportContentPlanHootsuite", null);
tslib_1.__decorate([
    (0, common_1.Get)('content-plans/:id/export/data'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_s = typeof Promise !== "undefined" && Promise) === "function" ? _s : Object)
], SocialMediaController.prototype, "getContentPlanExportData", null);
exports.SocialMediaController = SocialMediaController = tslib_1.__decorate([
    (0, common_1.Controller)('social-media'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof social_media_service_1.SocialMediaService !== "undefined" && social_media_service_1.SocialMediaService) === "function" ? _a : Object, typeof (_b = typeof export_service_1.ExportService !== "undefined" && export_service_1.ExportService) === "function" ? _b : Object])
], SocialMediaController);


/***/ }),
/* 82 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 83 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExportService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(12);
const social_media_content_plan_entity_1 = __webpack_require__(41);
let ExportService = class ExportService {
    constructor(contentPlanRepository) {
        this.contentPlanRepository = contentPlanRepository;
    }
    async exportContentPlanData(planId, userId) {
        const plan = await this.contentPlanRepository.findOne({
            where: { id: planId },
            relations: ['posts', 'posts.writerProfile', 'blogPost', 'company']
        });
        if (!plan) {
            throw new common_1.NotFoundException('Content plan not found');
        }
        // Verify user has access
        if (plan.userId !== userId) {
            throw new common_1.NotFoundException('Content plan not found');
        }
        return {
            plan: {
                id: plan.id,
                status: plan.status,
                platforms: plan.selectedPlatforms,
                writerProfiles: plan.selectedWriterProfiles,
                publishingFrequency: plan.publishingFrequency,
                totalPosts: plan.posts.length,
                createdAt: plan.createdAt.toISOString()
            },
            blogPost: {
                title: plan.blogPost.title,
                excerpt: plan.blogPost.excerpt,
                wordCount: plan.blogPost.wordCount,
                estimatedReadTime: plan.blogPost.estimatedReadTime
            },
            posts: plan.posts.map(post => ({
                id: post.id,
                platform: post.platform,
                content: post.content,
                hashtags: post.hashtags.join(' '),
                callToAction: post.callToAction || '',
                mediaType: post.mediaType,
                angle: post.angle,
                status: post.status,
                characterCount: post.characterCount,
                writerProfile: post.writerProfile?.name || 'Unknown',
                visualConcepts: this.formatVisualConcepts(post.visualConcepts),
                aiPrompts: this.extractAIPrompts(post.visualConcepts),
                videoScripts: this.extractVideoScripts(post.visualConcepts),
                suggestedCTAs: this.extractSuggestedCTAs(post.visualConcepts)
            }))
        };
    }
    generateCSV(data) {
        const headers = [
            'Post ID', 'Platform', 'Content', 'Hashtags', 'Call to Action',
            'Media Type', 'Angle', 'Status', 'Character Count', 'Writer Profile',
            'Visual Concepts', 'AI Prompts', 'Video Scripts', 'Suggested CTAs'
        ];
        const rows = data.posts.map(post => [
            post.id,
            post.platform,
            `"${post.content.replace(/"/g, '""')}"`,
            `"${post.hashtags}"`,
            `"${post.callToAction.replace(/"/g, '""')}"`,
            post.mediaType,
            post.angle,
            post.status,
            post.characterCount.toString(),
            `"${post.writerProfile}"`,
            `"${post.visualConcepts.replace(/"/g, '""')}"`,
            `"${post.aiPrompts.replace(/"/g, '""')}"`,
            `"${post.videoScripts.replace(/"/g, '""')}"`,
            `"${post.suggestedCTAs.replace(/"/g, '""')}"`
        ]);
        return [
            `# Content Plan Export - ${data.plan.id}`,
            `# Blog Post: ${data.blogPost.title}`,
            `# Total Posts: ${data.plan.totalPosts} across ${data.plan.platforms.length} platforms`,
            `# Generated: ${new Date().toISOString()}`,
            '',
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    }
    generateNotionFormat(data) {
        return {
            database_title: `Social Media Content Plan - ${data.blogPost.title}`,
            properties: {
                'Post ID': { type: 'title' },
                'Platform': { type: 'select' },
                'Content': { type: 'rich_text' },
                'Hashtags': { type: 'rich_text' },
                'Call to Action': { type: 'rich_text' },
                'Media Type': { type: 'select' },
                'Angle': { type: 'select' },
                'Status': { type: 'select' },
                'Character Count': { type: 'number' },
                'Writer Profile': { type: 'rich_text' },
                'AI Prompts': { type: 'rich_text' },
                'Video Scripts': { type: 'rich_text' },
                'Suggested CTAs': { type: 'rich_text' }
            },
            pages: data.posts.map(post => ({
                properties: {
                    'Post ID': { title: [{ text: { content: post.id } }] },
                    'Platform': { select: { name: post.platform } },
                    'Content': { rich_text: [{ text: { content: post.content } }] },
                    'Hashtags': { rich_text: [{ text: { content: post.hashtags } }] },
                    'Call to Action': { rich_text: [{ text: { content: post.callToAction } }] },
                    'Media Type': { select: { name: post.mediaType } },
                    'Angle': { select: { name: post.angle } },
                    'Status': { select: { name: post.status } },
                    'Character Count': { number: post.characterCount },
                    'Writer Profile': { rich_text: [{ text: { content: post.writerProfile } }] },
                    'AI Prompts': { rich_text: [{ text: { content: post.aiPrompts } }] },
                    'Video Scripts': { rich_text: [{ text: { content: post.videoScripts } }] },
                    'Suggested CTAs': { rich_text: [{ text: { content: post.suggestedCTAs } }] }
                }
            }))
        };
    }
    generateBufferFormat(data) {
        return data.posts.map(post => ({
            text: post.content + '\n\n' + post.hashtags,
            profile_ids: [], // Would need to be configured based on user's Buffer setup
            scheduled_at: null, // Could be calculated based on publishing frequency
            media: {
                description: post.visualConcepts,
                photo: post.aiPrompts ? 'AI_GENERATED_PLACEHOLDER' : null
            },
            service_link: null
        }));
    }
    generateHootsuiteFormat(data) {
        return data.posts.map(post => ({
            text: post.content,
            hashtags: post.hashtags.split(' ').filter(tag => tag.startsWith('#')),
            callToAction: post.callToAction,
            socialNetworks: [post.platform],
            mediaType: post.mediaType,
            scheduledSendTime: null, // Would be calculated based on frequency
            metadata: {
                angle: post.angle,
                writerProfile: post.writerProfile,
                visualConcepts: post.visualConcepts,
                aiPrompts: post.aiPrompts
            }
        }));
    }
    formatVisualConcepts(visualConcepts) {
        if (!visualConcepts || visualConcepts.length === 0)
            return '';
        return visualConcepts.map(concept => `${concept.type}: ${concept.description}`).join('; ');
    }
    extractAIPrompts(visualConcepts) {
        if (!visualConcepts || visualConcepts.length === 0)
            return '';
        return visualConcepts
            .filter(concept => concept.aiPrompt)
            .map(concept => concept.aiPrompt)
            .join('; ');
    }
    extractVideoScripts(visualConcepts) {
        if (!visualConcepts || visualConcepts.length === 0)
            return '';
        return visualConcepts
            .filter(concept => concept.script)
            .map(concept => concept.script)
            .join('; ');
    }
    extractSuggestedCTAs(visualConcepts) {
        if (!visualConcepts || visualConcepts.length === 0)
            return '';
        const allCTAs = visualConcepts
            .filter(concept => concept.suggestedCTAs)
            .flatMap(concept => concept.suggestedCTAs);
        return [...new Set(allCTAs)].join('; ');
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(social_media_content_plan_entity_1.SocialMediaContentPlan)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], ExportService);


/***/ }),
/* 84 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentLibraryModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const content_library_service_1 = __webpack_require__(85);
const content_library_controller_1 = __webpack_require__(86);
const content_asset_entity_1 = __webpack_require__(42);
const content_tag_entity_1 = __webpack_require__(44);
const reusable_snippet_entity_1 = __webpack_require__(45);
const media_asset_entity_1 = __webpack_require__(46);
const asset_usage_entity_1 = __webpack_require__(43);
const blog_post_entity_1 = __webpack_require__(38);
const social_media_post_entity_1 = __webpack_require__(40);
let ContentLibraryModule = class ContentLibraryModule {
};
exports.ContentLibraryModule = ContentLibraryModule;
exports.ContentLibraryModule = ContentLibraryModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                content_asset_entity_1.ContentAsset,
                content_tag_entity_1.ContentTag,
                reusable_snippet_entity_1.ReusableSnippet,
                media_asset_entity_1.MediaAsset,
                asset_usage_entity_1.AssetUsage,
                blog_post_entity_1.BlogPost,
                social_media_post_entity_1.SocialMediaPost
            ])
        ],
        controllers: [content_library_controller_1.ContentLibraryController],
        providers: [content_library_service_1.ContentLibraryService],
        exports: [content_library_service_1.ContentLibraryService]
    })
], ContentLibraryModule);


/***/ }),
/* 85 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentLibraryService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(12);
const content_asset_entity_1 = __webpack_require__(42);
const content_tag_entity_1 = __webpack_require__(44);
const reusable_snippet_entity_1 = __webpack_require__(45);
const media_asset_entity_1 = __webpack_require__(46);
const asset_usage_entity_1 = __webpack_require__(43);
const blog_post_entity_1 = __webpack_require__(38);
const social_media_post_entity_1 = __webpack_require__(40);
let ContentLibraryService = class ContentLibraryService {
    constructor(contentAssetRepository, contentTagRepository, reusableSnippetRepository, mediaAssetRepository, assetUsageRepository, blogPostRepository, socialMediaPostRepository) {
        this.contentAssetRepository = contentAssetRepository;
        this.contentTagRepository = contentTagRepository;
        this.reusableSnippetRepository = reusableSnippetRepository;
        this.mediaAssetRepository = mediaAssetRepository;
        this.assetUsageRepository = assetUsageRepository;
        this.blogPostRepository = blogPostRepository;
        this.socialMediaPostRepository = socialMediaPostRepository;
    }
    async searchContentLibrary(searchRequest, userId) {
        const { filters, sort, pagination } = searchRequest;
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 20;
        const offset = (page - 1) * limit;
        // Build base queries
        const assetQuery = this.buildAssetQuery(filters, userId);
        const snippetQuery = this.buildSnippetQuery(filters, userId);
        const mediaQuery = this.buildMediaQuery(filters, userId);
        // Apply sorting
        if (sort) {
            const sortField = this.mapSortField(sort.field);
            assetQuery.orderBy(sortField, sort.direction.toUpperCase());
            snippetQuery.orderBy(sortField, sort.direction.toUpperCase());
            mediaQuery.orderBy(sortField, sort.direction.toUpperCase());
        }
        else {
            assetQuery.orderBy('asset.updatedAt', 'DESC');
            snippetQuery.orderBy('snippet.updatedAt', 'DESC');
            mediaQuery.orderBy('media.updatedAt', 'DESC');
        }
        // Execute queries
        const [assets, assetsCount] = await assetQuery
            .limit(limit)
            .offset(offset)
            .getManyAndCount();
        const [snippets, snippetsCount] = await snippetQuery
            .limit(limit)
            .offset(offset)
            .getManyAndCount();
        const [mediaAssets, mediaCount] = await mediaQuery
            .limit(limit)
            .offset(offset)
            .getManyAndCount();
        // Get available tags for filtering
        const tags = await this.contentTagRepository.find({
            where: { companyId: filters.companyId },
            order: { name: 'ASC' }
        });
        const totalCount = assetsCount + snippetsCount + mediaCount;
        const totalPages = Math.ceil(totalCount / limit);
        return {
            assets: assets.map(asset => this.mapContentAssetToInterface(asset)),
            snippets: snippets.map(snippet => this.mapReusableSnippetToInterface(snippet)),
            mediaAssets: mediaAssets.map(media => this.mapMediaAssetToInterface(media)),
            totalCount,
            totalPages,
            currentPage: page,
            tags: tags.map(tag => this.mapContentTagToInterface(tag))
        };
    }
    buildAssetQuery(filters, userId) {
        const query = this.contentAssetRepository
            .createQueryBuilder('asset')
            .leftJoinAndSelect('asset.user', 'user')
            .leftJoinAndSelect('asset.company', 'company')
            .leftJoinAndSelect('asset.usageHistory', 'usage');
        if (filters.companyId) {
            query.andWhere('asset.companyId = :companyId', { companyId: filters.companyId });
        }
        if (filters.type) {
            const types = Array.isArray(filters.type) ? filters.type : [filters.type];
            query.andWhere('asset.type IN (:...types)', { types });
        }
        if (filters.status) {
            const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
            query.andWhere('asset.status IN (:...statuses)', { statuses });
        }
        if (filters.tags && filters.tags.length > 0) {
            // JSON search for tags array
            const tagConditions = filters.tags.map((_, index) => `JSON_CONTAINS(asset.tags, :tag${index})`).join(' OR ');
            query.andWhere(`(${tagConditions})`);
            filters.tags.forEach((tag, index) => {
                query.setParameter(`tag${index}`, JSON.stringify(tag));
            });
        }
        if (filters.category) {
            query.andWhere('asset.category = :category', { category: filters.category });
        }
        if (filters.search) {
            query.andWhere('(asset.title LIKE :search OR asset.description LIKE :search)', { search: `%${filters.search}%` });
        }
        if (filters.dateRange) {
            query.andWhere('asset.createdAt BETWEEN :from AND :to', {
                from: filters.dateRange.from,
                to: filters.dateRange.to
            });
        }
        return query;
    }
    buildSnippetQuery(filters, userId) {
        const query = this.reusableSnippetRepository
            .createQueryBuilder('snippet')
            .leftJoinAndSelect('snippet.user', 'user')
            .leftJoinAndSelect('snippet.company', 'company');
        if (filters.companyId) {
            query.andWhere('snippet.companyId = :companyId', { companyId: filters.companyId });
        }
        // Only include snippet types in search
        if (!filters.type || (Array.isArray(filters.type) && filters.type.includes('reusable_snippet'))) {
            // Continue with snippet query
        }
        else {
            // Return empty query if not searching for snippets
            query.andWhere('1 = 0');
        }
        if (filters.tags && filters.tags.length > 0) {
            const tagConditions = filters.tags.map((_, index) => `JSON_CONTAINS(snippet.tags, :tag${index})`).join(' OR ');
            query.andWhere(`(${tagConditions})`);
            filters.tags.forEach((tag, index) => {
                query.setParameter(`tag${index}`, JSON.stringify(tag));
            });
        }
        if (filters.search) {
            query.andWhere('(snippet.title LIKE :search OR snippet.content LIKE :search)', { search: `%${filters.search}%` });
        }
        if (filters.dateRange) {
            query.andWhere('snippet.createdAt BETWEEN :from AND :to', {
                from: filters.dateRange.from,
                to: filters.dateRange.to
            });
        }
        return query;
    }
    buildMediaQuery(filters, userId) {
        const query = this.mediaAssetRepository
            .createQueryBuilder('media')
            .leftJoinAndSelect('media.user', 'user')
            .leftJoinAndSelect('media.company', 'company')
            .leftJoinAndSelect('media.usageHistory', 'usage');
        if (filters.companyId) {
            query.andWhere('media.companyId = :companyId', { companyId: filters.companyId });
        }
        // Only include media types in search
        if (!filters.type || (Array.isArray(filters.type) &&
            (filters.type.includes('media_asset') || filters.type.includes('visual_asset')))) {
            // Continue with media query
        }
        else {
            // Return empty query if not searching for media
            query.andWhere('1 = 0');
        }
        if (filters.tags && filters.tags.length > 0) {
            const tagConditions = filters.tags.map((_, index) => `JSON_CONTAINS(media.tags, :tag${index})`).join(' OR ');
            query.andWhere(`(${tagConditions})`);
            filters.tags.forEach((tag, index) => {
                query.setParameter(`tag${index}`, JSON.stringify(tag));
            });
        }
        if (filters.category) {
            query.andWhere('media.category = :category', { category: filters.category });
        }
        if (filters.search) {
            query.andWhere('(media.title LIKE :search OR media.description LIKE :search)', { search: `%${filters.search}%` });
        }
        if (filters.dateRange) {
            query.andWhere('media.uploadedAt BETWEEN :from AND :to', {
                from: filters.dateRange.from,
                to: filters.dateRange.to
            });
        }
        return query;
    }
    mapSortField(field) {
        const mapping = {
            'createdAt': 'asset.createdAt',
            'updatedAt': 'asset.updatedAt',
            'title': 'asset.title',
            'timesUsed': 'asset.timesUsed',
            'lastUsed': 'asset.lastUsed'
        };
        return mapping[field] || 'asset.updatedAt';
    }
    async createContentTag(request, companyId, userId) {
        // Check if tag already exists
        const existingTag = await this.contentTagRepository.findOne({
            where: { name: request.name.toLowerCase(), companyId }
        });
        if (existingTag) {
            throw new common_1.BadRequestException('Tag with this name already exists');
        }
        const tag = this.contentTagRepository.create({
            name: request.name.toLowerCase(),
            type: request.type,
            color: request.color,
            description: request.description,
            companyId,
            userId
        });
        const savedTag = await this.contentTagRepository.save(tag);
        return this.mapContentTagToInterface(savedTag);
    }
    async updateContentAsset(request, userId) {
        const asset = await this.contentAssetRepository.findOne({
            where: { id: request.id }
        });
        if (!asset) {
            throw new common_1.NotFoundException('Content asset not found');
        }
        // Update fields
        if (request.title !== undefined)
            asset.title = request.title;
        if (request.description !== undefined)
            asset.description = request.description;
        if (request.tags !== undefined)
            asset.tags = request.tags;
        if (request.category !== undefined)
            asset.category = request.category;
        if (request.status !== undefined)
            asset.status = request.status;
        const updatedAsset = await this.contentAssetRepository.save(asset);
        return this.mapContentAssetToInterface(updatedAsset);
    }
    async createReusableSnippet(request, companyId, userId) {
        const snippet = this.reusableSnippetRepository.create({
            title: request.title,
            content: request.content,
            type: request.type,
            tags: request.tags || [],
            companyId,
            userId
        });
        const savedSnippet = await this.reusableSnippetRepository.save(snippet);
        return this.mapReusableSnippetToInterface(savedSnippet);
    }
    async updateReusableSnippet(request, userId) {
        const snippet = await this.reusableSnippetRepository.findOne({
            where: { id: request.id }
        });
        if (!snippet) {
            throw new common_1.NotFoundException('Reusable snippet not found');
        }
        // Update fields
        if (request.title !== undefined)
            snippet.title = request.title;
        if (request.content !== undefined)
            snippet.content = request.content;
        if (request.type !== undefined)
            snippet.type = request.type;
        if (request.tags !== undefined)
            snippet.tags = request.tags;
        const updatedSnippet = await this.reusableSnippetRepository.save(snippet);
        return this.mapReusableSnippetToInterface(updatedSnippet);
    }
    async trackAssetUsage(assetId, usedInType, usedInId, userId, platform) {
        // Create usage record
        const usage = this.assetUsageRepository.create({
            assetId,
            usedInType,
            usedInId,
            usedBy: userId,
            platform
        });
        await this.assetUsageRepository.save(usage);
        // Update asset usage count
        await this.contentAssetRepository.increment({ id: assetId }, 'timesUsed', 1);
        await this.contentAssetRepository.update({ id: assetId }, { lastUsed: new Date() });
    }
    // Auto-create content assets for existing blog posts and social posts
    async syncExistingContent(companyId, userId) {
        // Sync blog posts
        const blogPosts = await this.blogPostRepository.find({
            where: { companyId }
        });
        for (const blogPost of blogPosts) {
            const existingAsset = await this.contentAssetRepository.findOne({
                where: { blogPostId: blogPost.id }
            });
            if (!existingAsset) {
                const asset = this.contentAssetRepository.create({
                    title: blogPost.title,
                    description: blogPost.excerpt,
                    type: 'blog_post',
                    status: this.mapBlogPostStatus(blogPost.status),
                    blogPostId: blogPost.id,
                    tags: [], // Could extract from contentTopic.category
                    companyId,
                    userId: blogPost.userId,
                    createdAt: blogPost.createdAt,
                    updatedAt: blogPost.updatedAt
                });
                await this.contentAssetRepository.save(asset);
            }
        }
        // Sync social media posts
        const socialPosts = await this.socialMediaPostRepository.find({
            relations: ['contentPlan'],
            where: { contentPlan: { companyId } }
        });
        for (const socialPost of socialPosts) {
            const existingAsset = await this.contentAssetRepository.findOne({
                where: { socialPostId: socialPost.id }
            });
            if (!existingAsset) {
                const asset = this.contentAssetRepository.create({
                    title: `${socialPost.platform} Post - ${socialPost.content.substring(0, 50)}...`,
                    description: socialPost.content,
                    type: 'social_post',
                    status: this.mapSocialPostStatus(socialPost.status),
                    socialPostId: socialPost.id,
                    tags: [], // Could extract from hashtags
                    companyId,
                    userId: socialPost.writerProfileId, // Approximate
                    createdAt: socialPost.createdAt,
                    updatedAt: socialPost.updatedAt
                });
                await this.contentAssetRepository.save(asset);
            }
        }
    }
    mapBlogPostStatus(status) {
        const mapping = {
            'draft': 'draft',
            'outline_review': 'in_review',
            'content_review': 'in_review',
            'approved': 'approved',
            'published': 'published'
        };
        return mapping[status] || 'draft';
    }
    mapSocialPostStatus(status) {
        const mapping = {
            'draft': 'draft',
            'approved': 'approved',
            'scheduled': 'approved',
            'published': 'published'
        };
        return mapping[status] || 'draft';
    }
    mapContentAssetToInterface(asset) {
        return {
            id: asset.id,
            title: asset.title,
            description: asset.description,
            type: asset.type,
            status: asset.status,
            blogPostId: asset.blogPostId,
            socialPostId: asset.socialPostId,
            contentSnippetId: asset.contentSnippetId,
            mediaAssetId: asset.mediaAssetId,
            tags: asset.tags,
            category: asset.category,
            companyId: asset.companyId,
            userId: asset.userId,
            createdAt: asset.createdAt,
            updatedAt: asset.updatedAt,
            timesUsed: asset.timesUsed,
            lastUsed: asset.lastUsed,
            fileName: asset.fileName,
            fileSize: asset.fileSize,
            mimeType: asset.mimeType,
            url: asset.url,
            thumbnailUrl: asset.thumbnailUrl,
            usageHistory: asset.usageHistory?.map(usage => ({
                id: usage.id,
                assetId: usage.assetId,
                usedInType: usage.usedInType,
                usedInId: usage.usedInId,
                usedAt: usage.usedAt,
                usedBy: usage.usedBy,
                platform: usage.platform
            })) || []
        };
    }
    mapReusableSnippetToInterface(snippet) {
        return {
            id: snippet.id,
            title: snippet.title,
            content: snippet.content,
            type: snippet.type,
            tags: snippet.tags,
            companyId: snippet.companyId,
            userId: snippet.userId,
            createdAt: snippet.createdAt,
            updatedAt: snippet.updatedAt,
            timesUsed: snippet.timesUsed,
            lastUsed: snippet.lastUsed
        };
    }
    mapMediaAssetToInterface(media) {
        return {
            id: media.id,
            title: media.title,
            description: media.description,
            fileName: media.fileName,
            originalFileName: media.originalFileName,
            fileSize: media.fileSize,
            mimeType: media.mimeType,
            url: media.url,
            thumbnailUrl: media.thumbnailUrl,
            width: media.width,
            height: media.height,
            duration: media.duration,
            tags: media.tags,
            category: media.category,
            companyId: media.companyId,
            userId: media.userId,
            uploadedAt: media.uploadedAt,
            updatedAt: media.updatedAt,
            timesUsed: media.timesUsed,
            lastUsed: media.lastUsed,
            usageHistory: media.usageHistory?.map(usage => ({
                id: usage.id,
                assetId: usage.assetId,
                usedInType: usage.usedInType,
                usedInId: usage.usedInId,
                usedAt: usage.usedAt,
                usedBy: usage.usedBy,
                platform: usage.platform
            })) || []
        };
    }
    mapContentTagToInterface(tag) {
        return {
            id: tag.id,
            name: tag.name,
            type: tag.type,
            color: tag.color,
            description: tag.description,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt
        };
    }
};
exports.ContentLibraryService = ContentLibraryService;
exports.ContentLibraryService = ContentLibraryService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(content_asset_entity_1.ContentAsset)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(content_tag_entity_1.ContentTag)),
    tslib_1.__param(2, (0, typeorm_1.InjectRepository)(reusable_snippet_entity_1.ReusableSnippet)),
    tslib_1.__param(3, (0, typeorm_1.InjectRepository)(media_asset_entity_1.MediaAsset)),
    tslib_1.__param(4, (0, typeorm_1.InjectRepository)(asset_usage_entity_1.AssetUsage)),
    tslib_1.__param(5, (0, typeorm_1.InjectRepository)(blog_post_entity_1.BlogPost)),
    tslib_1.__param(6, (0, typeorm_1.InjectRepository)(social_media_post_entity_1.SocialMediaPost)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _e : Object, typeof (_f = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _f : Object, typeof (_g = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _g : Object])
], ContentLibraryService);


/***/ }),
/* 86 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentLibraryController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const content_library_service_1 = __webpack_require__(85);
const jwt_auth_guard_1 = __webpack_require__(28);
const shared_1 = __webpack_require__(15);
let ContentLibraryController = class ContentLibraryController {
    constructor(contentLibraryService) {
        this.contentLibraryService = contentLibraryService;
    }
    async searchContentLibrary(searchRequest, req) {
        return this.contentLibraryService.searchContentLibrary(searchRequest, req.user.id);
    }
    async createContentTag(request, companyId, req) {
        return this.contentLibraryService.createContentTag(request, companyId, req.user.id);
    }
    async updateContentAsset(id, request, req) {
        return this.contentLibraryService.updateContentAsset({ ...request, id }, req.user.id);
    }
    async createReusableSnippet(request, companyId, req) {
        return this.contentLibraryService.createReusableSnippet(request, companyId, req.user.id);
    }
    async updateReusableSnippet(id, request, req) {
        return this.contentLibraryService.updateReusableSnippet({ ...request, id }, req.user.id);
    }
    async trackAssetUsage(assetId, request, req) {
        return this.contentLibraryService.trackAssetUsage(assetId, request.usedInType, request.usedInId, req.user.id, request.platform);
    }
    async syncExistingContent(companyId, req) {
        await this.contentLibraryService.syncExistingContent(companyId, req.user.id);
        return { message: 'Content library synced successfully' };
    }
};
exports.ContentLibraryController = ContentLibraryController;
tslib_1.__decorate([
    (0, common_1.Post)('search'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof shared_1.ContentLibrarySearchRequest !== "undefined" && shared_1.ContentLibrarySearchRequest) === "function" ? _b : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], ContentLibraryController.prototype, "searchContentLibrary", null);
tslib_1.__decorate([
    (0, common_1.Post)('tags'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Query)('companyId')),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_d = typeof shared_1.CreateContentTagRequest !== "undefined" && shared_1.CreateContentTagRequest) === "function" ? _d : Object, String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], ContentLibraryController.prototype, "createContentTag", null);
tslib_1.__decorate([
    (0, common_1.Put)('assets/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_f = typeof Omit !== "undefined" && Omit) === "function" ? _f : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], ContentLibraryController.prototype, "updateContentAsset", null);
tslib_1.__decorate([
    (0, common_1.Post)('snippets'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Query)('companyId')),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_h = typeof shared_1.CreateReusableSnippetRequest !== "undefined" && shared_1.CreateReusableSnippetRequest) === "function" ? _h : Object, String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], ContentLibraryController.prototype, "createReusableSnippet", null);
tslib_1.__decorate([
    (0, common_1.Put)('snippets/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_k = typeof Omit !== "undefined" && Omit) === "function" ? _k : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], ContentLibraryController.prototype, "updateReusableSnippet", null);
tslib_1.__decorate([
    (0, common_1.Post)('assets/:id/track-usage'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], ContentLibraryController.prototype, "trackAssetUsage", null);
tslib_1.__decorate([
    (0, common_1.Post)('sync'),
    tslib_1.__param(0, (0, common_1.Query)('companyId')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], ContentLibraryController.prototype, "syncExistingContent", null);
exports.ContentLibraryController = ContentLibraryController = tslib_1.__decorate([
    (0, common_1.Controller)('content-library'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof content_library_service_1.ContentLibraryService !== "undefined" && content_library_service_1.ContentLibraryService) === "function" ? _a : Object])
], ContentLibraryController);


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const app_module_1 = __webpack_require__(3);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3333;
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();

})();

var __webpack_export_target__ = exports;
for(var __webpack_i__ in __webpack_exports__) __webpack_export_target__[__webpack_i__] = __webpack_exports__[__webpack_i__];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;