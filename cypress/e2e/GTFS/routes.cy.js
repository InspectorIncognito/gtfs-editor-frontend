import {TEST_GTFS_NAME} from "../../support/utils";
import {fillField, fillSelector, fillQuery, fillColor} from "../../support/utils";

const fields = [
    "route_id",
    "route_short_name",
    "route_long_name",
    "route_desc",
    "route_url",
];
const selectors = [
    "route_type"
];

const queries = {
    agency_id: {
        model: "agencies",
        url: "/api/projects/1/agencies/"
    },
};

const colors = [
    "route_color",
    "route_text_color",
]


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
    it("Create Routes", () => {
        cy.mockGETDataBefore();
        cy.mockTablesForData("cypress_test_gtfs/tablesRoutes.json");
        cy.reload();

        cy.contains("Routes").click();
        cy.url().should("contain", "/project/1/routes");
        cy.contains("Add row").click();

        fillField(fields);
        fillSelector(selectors);
        fillQuery(queries);
        fillColor(colors);

        cy.mockGETDataAfter();

        cy.contains("New entity").parent().parent().contains("Save").click();
    });
});