beforeEach(() => {
    cy.mockLogoutRequest();
    cy.login();
});

describe("Session logout", () => {
    it("Session logout", () => {
        cy.contains("Logout").click();
        cy.wait('@logoutRequest');
        cy.url().should("include", "/login");
        cy.getLocalStorage("utsk").then((token) => {
            expect(token).to.be.null;
        });
    })
})