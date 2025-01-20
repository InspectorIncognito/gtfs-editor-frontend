// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
const gtfsData = [
    "agencies",
    "calendars",
    "stops",
    "shapes",
    "routes",
    "trips",
    "frequencies",
    "calendardates",
    "fareattributes",
    "farerules",
    "transfers",
    "pathways",
    /*
    "stoptimes",
     */
    "levels"
]

Cypress.Commands.add("mockLoginRequest", () => {
    cy.fixture('loginResponse.json').then((loginResponse) => {
        cy.intercept(
            {
                method: "POST",
                url: "/api/user/login/",
            },
            loginResponse
        ).as("loginRequest");
    })
});

Cypress.Commands.add("mockLogoutRequest", () => {
    cy.fixture('logoutResponse.json').then((logoutResponse) => {
        cy.intercept(
            {
                method: "POST",
                url: "/api/user/logout/",
            },
            logoutResponse
        ).as("logoutRequest");
    })
});

Cypress.Commands.add("getLocalStorage", (item) => {
    cy.getAllLocalStorage().then((localStorage) => {
        const baseUrl = Cypress.config().baseUrl;
        return new Promise((resolve) => {
            const value = localStorage[baseUrl][item] ?? null;
            resolve(value);
        });
    });
});

Cypress.Commands.add("setDummyToken", () => {
    cy.window().then((win) => {
        win.localStorage.setItem("utsk", "sessionToken");
    });
});

Cypress.Commands.add("mockGetProjects", () => {
    cy.fixture("projectResponse.json").then((projectResponse) => {
        cy.intercept(
            {
                method: "GET",
                url: "/api/projects/?no_page",
            },
            projectResponse
        ).as("getProjects");
    })
})

Cypress.Commands.add("login", () => {
    cy.visit("/");
    cy.mockLoginRequest();
    cy.mockGetProjects();
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
})

Cypress.Commands.add("interceptProjects", () => {
    cy.fixture("noProjects.json").then((response) => {
        cy.intercept(
            {
                method: "GET",
                url: "/api/projects/?no_page",
            },
            response
        ).as("interceptProjects");
    })
})

Cypress.Commands.add("createGTFS", () => {
    cy.fixture("cypress_test_gtfs/getProject.json").then((response) => {
        cy.intercept(
            {
                method: "GET",
                url: "/api/projects/?no_page"
            },
            response
        ).as("getProject");
    });
    cy.fixture("cypress_test_gtfs/postProject.json").then((response) => {
        cy.intercept(
            {
                method: "POST",
                url: "/api/projects/",
            },
            response
        ).as("postProject");
    });

    cy.fixture("cypress_test_gtfs/id.json").then((response) => {
        cy.intercept(
            {
                method: "GET",
                url: "/api/projects/1/"
            },
            response
        ).as("getProject");
    });

    cy.fixture("cypress_test_gtfs/tables.json").then((response) => {
        cy.intercept(
            {
                method: "GET",
                url: "/api/projects/1/tables/"
            },
            response
        ).as("getTables");
    });
})

Cypress.Commands.add("postGTFSData", () => {
    for (let data of gtfsData) {
        cy.fixture(`POST/${data}.json`).then((response) => {
            cy.intercept(
                {
                    method: "POST",
                    url: `/api/projects/1/${data}/`
                },
                response
            ).as(`post_${data}`);
        });
    }
});

Cypress.Commands.add("mockGETDataBefore", () => {
    cy.fixture("GET/emptyData.json").then((response) => {
        for (let data of gtfsData) {
            cy.intercept(
                {
                    method: "GET",
                    url: `/api/projects/1/${data}/?sort=&page=1&per_page=10&search=`
                },
                response
            ).as(`get_${data}_before`);
        }
    });
    cy.fixture("noProjects.json").then((response) => {
        for (let data of gtfsData) {
            cy.intercept(
                {
                    method: "GET",
                    url: `/api/projects/1/${data}/?no_page=True`
                },
                response
            ).as(`get_${data}_before_no_page`);
        }
    });

});

Cypress.Commands.add("mockGETDataAfter", () => {
    for (let data of gtfsData) {
        cy.fixture(`GET/${data}.json`).then((response) => {
            cy.intercept(
                {
                    method: "GET",
                    url: `/api/projects/1/${data}/?sort=&page=1&per_page=10&search=`
                },
                response
            ).as(`get_${data}_after`);
        });
        cy.fixture(`noProjects.json`).then((response) => {
            cy.intercept(
                {
                    method: "GET",
                    url: `/api/projects/1/${data}/?no_page=True`
                },
                response
            ).as(`get_${data}_after_no_page`);
        });
    }
});

Cypress.Commands.add("mockTablesForData", (filename)=> {
    cy.fixture(filename).then((response)=>{
        cy.intercept(
            {
                method: "GET",
                url: "/api/projects/1/tables/"
            },
            response
        ).as("getCustomTable");
    });
});