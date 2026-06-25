import { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.usernameInput = page.locator('[data-test="username"]');
        this.passwordInput = page.locator('[data-test="password"]');
        this.loginButton = page.locator('[data-test="login-button"]');
        this.errorMessage = page.locator('[data-test="error"]');
    }

    async navigateTo() {
        await this.page.goto('/');
    }

    async login(user: string, pass: string) {
        await this.typeInto(this.usernameInput, user, 'Trường Username');
        await this.typeInto(this.passwordInput, pass, 'Trường Password');
        await this.clickOn(this.loginButton, 'Nút Login');
    }
}