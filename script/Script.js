/* =========================================================
   CONFIGURATION
========================================================= */

const responsables = [
    "Adnane",
    "Brahim",
    "Faraj",
    "Hakim",
    "Majdeline",
    "Younes",
    "Youssef"
];


const types = [
    "B30",
    "B40",
    "B30 Hydro",
    "B40 Hydro",
    "B50"
];


/* =========================================================
   VARIABLES
========================================================= */

let donnees = [];

let moisSelectionne = "";


/* =========================================================
   CHARGEMENT DU JSON
========================================================= */

fetch("../data/data.json")

    .then(response => {

        if (!response.ok) {

            throw new Error(
                "Impossible de charger data.json"
            );

        }

        return response.json();

    })

    .then(data => {

        console.log(
            "Données JSON :",
            data
        );

        donnees = Array.isArray(data)
            ? data
            : [];

        initialiserDashboard();

    })

    .catch(error => {

        console.error(
            "Erreur de chargement du JSON :",
            error
        );

    });


/* =========================================================
   INITIALISATION
========================================================= */

function initialiserDashboard() {

    if (donnees.length === 0) {

        console.warn(
            "Aucune donnée disponible."
        );

        return;

    }


    construireEntetes();


    const moisDisponibles =
        obtenirMoisDisponibles();


    remplirFiltreMois(
        moisDisponibles
    );


    if (moisDisponibles.length === 0) {

        return;

    }


    /*
       Priorité :

       1. Mois actuel
       2. Dernier mois disponible
    */

    const maintenant = new Date();

    const moisActuel =
        maintenant.getFullYear() +
        "-" +
        String(
            maintenant.getMonth() + 1
        ).padStart(2, "0");


    if (
        moisDisponibles.includes(
            moisActuel
        )
    ) {

        moisSelectionne =
            moisActuel;

    } else {

        moisSelectionne =
            moisDisponibles[
                moisDisponibles.length - 1
            ];

    }


    document.getElementById(
        "filtreMois"
    ).value = moisSelectionne;


    mettreAJourDashboard();

}


/* =========================================================
   CONSTRUIRE LES ENTÊTES
========================================================= */

function construireEntetes() {

    const ligneResponsables =
        document.getElementById(
            "headerResponsables"
        );


    const ligneTypes =
        document.getElementById(
            "headerTypes"
        );


    /*
       Nettoyage
    */

    ligneResponsables
        .querySelectorAll(
            ".responsable-header, .ecart-header"
        )
        .forEach(
            element => element.remove()
        );


    ligneTypes.innerHTML = "";


    /*
       Responsables
    */

    responsables.forEach(
        (responsable, index) => {

            const th =
                document.createElement("th");

            th.className =
                "responsable-header";

            th.colSpan =
                types.length;

            th.textContent =
                responsable;

            ligneResponsables.appendChild(
                th
            );


            /*
               Types
            */

            types.forEach(
                (type, typeIndex) => {

                    const typeTh =
                        document.createElement(
                            "th"
                        );

                    typeTh.className =
                        "type-header";


                    /*
                       Séparateur après
                       le dernier type
                    */

                    if (
                        typeIndex ===
                        types.length - 1
                    ) {

                        typeTh.classList.add(
                            "group-separator"
                        );

                    }


                    /*
                       Affichage sur 2 lignes
                    */

                    if (
                        type ===
                        "B30 Hydro"
                    ) {

                        typeTh.innerHTML =
                            "B30<br>Hydro";

                    }

                    else if (
                        type ===
                        "B40 Hydro"
                    ) {

                        typeTh.innerHTML =
                            "B40<br>Hydro";

                    }

                    else {

                        typeTh.textContent =
                            type;

                    }


                    ligneTypes.appendChild(
                        typeTh
                    );

                }

            );

        }

    );


    /*
       Colonne Écart Total
    */

    const totalHeader =
        document.createElement("th");

    totalHeader.className =
        "ecart-header";

    totalHeader.rowSpan = 2;

    totalHeader.innerHTML =
        "Écart<br>Total";

    ligneResponsables.appendChild(
        totalHeader
    );

}


/* =========================================================
   OBTENIR LES MOIS
========================================================= */

function obtenirMoisDisponibles() {

    const mois = new Set();


    donnees.forEach(
        ligne => {

            const date =
                convertirDate(
                    ligne.date
                );


            if (!date) {

                return;

            }


            const cle =
                date.getFullYear() +
                "-" +
                String(
                    date.getMonth() + 1
                ).padStart(2, "0");


            mois.add(cle);

        }
    );


    return Array.from(mois)
        .sort();

}


/* =========================================================
   FILTRE MOIS
========================================================= */

function remplirFiltreMois(
    moisDisponibles
) {

    const select =
        document.getElementById(
            "filtreMois"
        );


    select.innerHTML = "";


    moisDisponibles.forEach(
        mois => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                mois;

            option.textContent =
                formaterMois(
                    mois
                );

            select.appendChild(
                option
            );

        }
    );


    select.addEventListener(
        "change",
        function () {

            moisSelectionne =
                this.value;

            mettreAJourDashboard();

        }
    );

}


/* =========================================================
   MISE À JOUR DASHBOARD
========================================================= */

function mettreAJourDashboard() {

    const donneesMois =
        donnees.filter(
            ligne =>
                appartientAuMois(
                    ligne.date,
                    moisSelectionne
                )
        );


    mettreAJourKPI(
        donneesMois
    );


    mettreAJourHeader(
        moisSelectionne
    );


    construireTableau(
        donneesMois
    );

}


/* =========================================================
   KPI
========================================================= */

function mettreAJourKPI(
    donneesMois
) {

    let totalRB = 0;

    let totalRT = 0;

    let totalEcart = 0;


    donneesMois.forEach(
        ligne => {

            totalRB +=
                convertirNombre(
                    ligne.RB
                );

            totalRT +=
                convertirNombre(
                    ligne.RT
                );

            totalEcart +=
                convertirNombre(
                    ligne.ecart
                );

        }
    );


    document.getElementById(
        "kpiRB"
    ).textContent =
        formaterNombre(
            totalRB
        ) +
        " m³";


    document.getElementById(
        "kpiRT"
    ).textContent =
        formaterNombre(
            totalRT
        ) +
        " m³";


    document.getElementById(
        "kpiEcart"
    ).textContent =
        formaterNombre(
            totalEcart
        ) +
        " m³";

}


/* =========================================================
   HEADER
========================================================= */

function mettreAJourHeader(
    mois
) {

    const texte =
        formaterMois(
            mois
        );


    const parties =
        texte.split(" ");


    const moisNom =
        parties[0] || "";


    const annee =
        parties[1] || "";


    document.getElementById(
        "headerMois"
    ).textContent =
        moisNom.toUpperCase();


    document.getElementById(
        "headerAnnee"
    ).textContent =
        annee;


    document.getElementById(
        "tableMois"
    ).textContent =
        texte;

}


/* =========================================================
   CONSTRUCTION DU TABLEAU
========================================================= */

function construireTableau(
    donneesMois
) {

    const tbody =
        document.getElementById(
            "TableauBody"
        );


    tbody.innerHTML = "";


    /*
       Liste des dates
    */

    const dates = [
        ...new Set(

            donneesMois
                .map(
                    ligne =>
                        normaliserDate(
                            ligne.date
                        )
                )

        )
    ]
    .filter(Boolean)
    .sort(
        comparerDates
    );


    /*
       Une ligne par date
    */

    dates.forEach(
        dateISO => {

            const tr =
                document.createElement(
                    "tr"
                );


            /*
               Date
            */

            const dateCell =
                document.createElement(
                    "td"
                );

            dateCell.textContent =
                afficherDate(
                    dateISO
                );

            tr.appendChild(
                dateCell
            );


            /*
               Total de la date
            */

            let totalDate = 0;


            /*
               Responsables
            */

            responsables.forEach(
                responsable => {

                    types.forEach(
                        (type, typeIndex) => {

                            const cell =
                                document.createElement(
                                    "td"
                                );


                            const valeur =
                                obtenirEcart(
                                    donneesMois,
                                    dateISO,
                                    responsable,
                                    type
                                );


                            totalDate +=
                                valeur;


                            /*
                               Affichage
                            */

                            if (
                                Math.abs(
                                    valeur
                                ) < 0.1
                            ) {

                                cell.textContent =
                                    "";

                                cell.classList.add(
                                    "zero-value"
                                );

                            } else if (valeur > 0) {
                                cell.textContent = "+" +
                                    formaterNombre(
                                        valeur
                                    );
                            }

                            else {

                                cell.textContent =
                                    formaterNombre(
                                        valeur
                                    );

                                cell.classList.add(
                                    "ecart-cell"
                                );


                                /*
                                   Couleur discrète
                                */

                                if (
                                    valeur > 0
                                ) {

                                    cell.classList.add(
                                        "ecart-positive"
                                    );

                                }

                                else {

                                    cell.classList.add(
                                        "ecart-negative"
                                    );

                                }

                            }


                            /*
                               Séparateur
                               groupe responsable
                            */

                            if (
                                typeIndex ===
                                types.length - 1
                            ) {

                                cell.classList.add(
                                    "group-separator"
                                );

                            }


                            tr.appendChild(
                                cell
                            );

                        }
                    );

                }
            );


            /*
               Écart Total
            */

            const totalCell =
                document.createElement(
                    "td"
                );


            totalCell.classList.add(
                "total-ecart"
            );


            totalCell.textContent =
                formaterNombre(
                    totalDate
                );


            if (
                totalDate > 0
            ) {

                totalCell.classList.add(
                    "total-positive"
                );

            }

            else if (
                totalDate < 0
            ) {

                totalCell.classList.add(
                    "total-negative"
                );

            }


            tr.appendChild(
                totalCell
            );


            tbody.appendChild(
                tr
            );

        }
    );


    /*
       Si aucune donnée
    */

    if (
        dates.length === 0
    ) {

        const tr =
            document.createElement(
                "tr"
            );


        const td =
            document.createElement(
                "td"
            );


        td.colSpan =
            1 +
            (
                responsables.length *
                types.length
            ) +
            1;


        td.textContent =
            "Aucune donnée disponible pour ce mois.";


        td.style.padding =
            "30px";


        td.style.color =
            "#7c8d9d";


        tr.appendChild(
            td
        );


        tbody.appendChild(
            tr
        );

    }

}


/* =========================================================
   OBTENIR ÉCART
========================================================= */

function obtenirEcart(
    data,
    dateISO,
    responsable,
    type
) {

    let total = 0;


    data.forEach(
        ligne => {

            const ligneDate =
                normaliserDate(
                    ligne.date
                );


            if (
                ligneDate !== dateISO
            ) {

                return;

            }


            if (
                nettoyerTexte(
                    ligne.responsable
                ) !==
                nettoyerTexte(
                    responsable
                )
            ) {

                return;

            }


            if (
                nettoyerTexte(
                    ligne.type
                ) !==
                nettoyerTexte(
                    type
                )
            ) {

                return;

            }


            total +=
                convertirNombre(
                    ligne.ecart
                );

        }
    );


    return total;

}


/* =========================================================
   CONVERSION DATE
========================================================= */

function convertirDate(
    valeur
) {

    if (!valeur) {

        return null;

    }


    /*
       Déjà Date
    */

    if (
        valeur instanceof Date
    ) {

        return valeur;

    }


    const texte =
        String(
            valeur
        ).trim();


    /*
       dd/mm/yyyy
    */

    const match =
        texte.match(
            /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
        );


    if (match) {

        return new Date(
            Number(match[3]),
            Number(match[2]) - 1,
            Number(match[1])
        );

    }


    /*
       yyyy-mm-dd
    */

    const date =
        new Date(
            texte
        );


    if (
        !isNaN(
            date.getTime()
        )
    ) {

        return date;

    }


    return null;

}


/* =========================================================
   NORMALISER DATE
========================================================= */

function normaliserDate(
    valeur
) {

    const date =
        convertirDate(
            valeur
        );


    if (!date) {

        return null;

    }


    return (
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            date.getDate()
        ).padStart(2, "0")
    );

}


/* =========================================================
   AFFICHER DATE
========================================================= */

function afficherDate(
    dateISO
) {

    const parties =
        dateISO.split("-");


    return (
        parties[2] +
        "/" +
        parties[1] +
        "/" +
        parties[0]
    );

}


/* =========================================================
   APPARTENANCE AU MOIS
========================================================= */

function appartientAuMois(
    dateValeur,
    mois
) {

    const date =
        convertirDate(
            dateValeur
        );


    if (!date) {

        return false;

    }


    const cle =
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    return (
        cle === mois
    );

}


/* =========================================================
   FORMAT MOIS
========================================================= */

function formaterMois(
    mois
) {

    const [annee, numero] =
        mois.split("-");


    const nomsMois = [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre"
    ];


    return (
        nomsMois[
            Number(numero) - 1
        ] +
        " " +
        annee
    );

}


/* =========================================================
   CONVERSION NOMBRE
========================================================= */

function convertirNombre(
    valeur
) {

    if (
        valeur === null ||
        valeur === undefined ||
        valeur === ""
    ) {

        return 0;

    }


    if (
        typeof valeur === "number"
    ) {

        return valeur;

    }


    let texte =
        String(
            valeur
        ).trim();


    /*
       Suppression espaces
    */

    texte =
        texte.replace(
            /\s/g,
            ""
        );


    /*
       Virgule française
    */

    texte =
        texte.replace(
            ",",
            "."
        );


    const nombre =
        Number(
            texte
        );


    return isNaN(
        nombre
    )
        ? 0
        : nombre;

}


/* =========================================================
   FORMAT NOMBRE
========================================================= */

function formaterNombre(
    nombre
) {

    const valeur =
        Number(
            nombre
        );


    if (
        Math.abs(valeur) < 0.1
    ) {
        
        return "0";

    }


    return valeur.toLocaleString(
        "fr-FR",
        {
            minimumFractionDigits:
                Number.isInteger(
                    valeur
                )
                    ? 0
                    : 1,

            maximumFractionDigits:
                1
        }
    );

}


/* =========================================================
   NETTOYAGE TEXTE
========================================================= */

function nettoyerTexte(
    texte
) {

    return String(
        texte ?? ""
    )
    .trim()
    .toLowerCase()
    .normalize(
        "NFD"
    )
    .replace(
        /[\u0300-\u036f]/g,
        ""
    );

}


/* =========================================================
   COMPARAISON DATES
========================================================= */

function comparerDates(
    a,
    b
) {

    return (
        new Date(a) -
        new Date(b)
    );

}