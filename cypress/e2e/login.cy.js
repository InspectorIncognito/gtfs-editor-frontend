beforeEach(() => {
    cy.mockLoginRequest();
    cy.mockGetProjects();
})

describe("Login view", () => {
    it("Show login view", () => {
        cy.visit("/");
        cy.contains("Login");
        cy.contains("Username");
        cy.contains("Password");
    })

    it("Redirects to the main view if the user logs in successfully", ()=>{
        cy.visit("/");
        cy.get("input[name=username]").type("valid@mail.com");
        cy.get("input[name=password]").type("validPassword");
        cy.get("#login-button").click();
        cy.wait("@loginRequest");
        cy.wait("@getProjects");
        cy.url().should("include", "/myprojects");
        cy.getLocalStorage('utsk').then((token) => {
          expect(token).to.exist;
          expect(token).to.equal("sessionToken");
        });
    });
})
