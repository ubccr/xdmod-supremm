import {expect} from '@playwright/test';
import {BasePage} from "./base.page";
import selectors from "./xdmod.selectors";

class XDMoD extends BasePage {
    readonly selectors = selectors;

    async selectTab(tabId:string){
        const tabLocator = this.page.locator(this.selectors.tab(tabId));
        const panel = this.page.locator(this.selectors.panel(tabId));

        await tabLocator.click();
        await panel.waitFor({state:'visible'});
        await this.page.waitForFunction('() => document.body.className.indexOf("x-masked") === -1');
    }
}
export default XDMoD;
