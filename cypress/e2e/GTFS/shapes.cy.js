const TEST_GTFS_NAME = "cypress_test_gtfs";
before(() => {
    cy.login();
});

beforeEach(() => {
    cy.createGTFS();
    cy.postGTFSData();
    cy.visit("/myprojects");
    cy.contains(TEST_GTFS_NAME).click();
})

describe("GTFS Agencies creation", () => {
    it("Create Agencies", () => {
        cy.mockGETDataBefore();

        cy.contains("Shapes").click();
        cy.url().should("contain", "/project/1/shapes");

        cy.contains("add").click();

        cy.get("input[placeholder=shape_id]").type("TEST_SHAPE");
        cy.get(".mapboxgl-canvas").dblclick();

        cy.contains("Map Matching").parent().get(".switch").click();

        cy.mockGETDataAfter();

        cy.contains("check").click();
    });
});