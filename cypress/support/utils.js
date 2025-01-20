export const TEST_GTFS_NAME = "cypress_test_gtfs";

export function fillField(fields) {
    for (let field of fields) {
        cy.get(`input[name=${field}]`).type("something");
    }
}

export function fillNumber(fields) {
    for (let field of fields) {
        cy.get(`input[name=${field}]`).type("123");
    }
}

export function fillSelector(fields) {
    for (let field of fields) {
        cy.get(`div[name=${field}]`).type("{enter}");
    }
}

export function fillQuery(fields) {
    for (const [field, value] of Object.entries(fields)) {
        const model = value.model;
        const url = value.url;
        cy.fixture(`GET/${model}.json`).then((response) => {
            cy.intercept(
                {
                    method: "GET",
                    url: url
                },
                response).as(`mock_query_${model}`);
        });

        cy.get(`div[name=${field}]`).type("{enter}");
    }
}

export function fillClick(fields) {
    for (let field of fields) {
        cy.get(`label[name=${field}]`).click();
    }
}

export function fillDate(fields) {
    for (let field of fields) {
        cy.get(`input[name=${field}]`).type("2025-01-01");
    }
}

export function fillDay(fields) {
    for (let field of fields) {
        cy.get(`label[name=${field}]`).click();
    }
}

export function fillTime(fields) {
    for (let field of fields) {
        cy.get(`input[name=${field}]`).type("00:00:00");
    }
}

export function fillColor(fields) {
    for (let field of fields) {
        cy.get(`div[name=${field}]`).type("000000{enter}");
    }
}

export default {fillField, fillNumber, fillSelector, fillQuery, fillClick, fillDate, fillDay, fillTime, fillColor};