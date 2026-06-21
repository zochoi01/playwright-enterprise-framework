import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page";

export class CheckoutPage extends BasePage {
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly postalCodeInput: Locator;
    private readonly continueButton: Locator;
    private readonly finishButton: Locator;
    readonly completeHeader: Locator;

    constructor(page: Page) {
        super(page);
        this.firstNameInput = page.locator('[data-test="firstName"]');
        this.lastNameInput = page.locator('[data-test="lastName"]');
        this.postalCodeInput = page.locator('[data-test="postalCode"]');
        this.continueButton = page.locator('[data-test="continue"]');
        this.finishButton = page.locator('[data-test="finish"]');
        this.completeHeader = page.locator('.complete-header');
    }

    async fillCheckoutInformation(firstName: string, lastName: string, postalCode: string) {
        await this.typeInto(this.firstNameInput, firstName, 'Trường First Name');
        await this.typeInto(this.lastNameInput, lastName, 'Trường Last Name');
        await this.typeInto(this.postalCodeInput, postalCode, 'Trường Postal Code');
    }

    async continueCheckout() {
        await this.clickOn(this.continueButton, 'Nút Continue');
    }

    async finishCheckout() {
        await this.clickOn(this.finishButton, 'Nút Finish');
    }
}