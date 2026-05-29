-- Tabellen löschen (richtige Reihenfolge!)
DROP TABLE IF EXISTS bewertung;
DROP TABLE IF EXISTS teilnahme;
DROP TABLE IF EXISTS kommentar;
DROP TABLE IF EXISTS interesse;
DROP TABLE IF EXISTS aktivitaet;
DROP TABLE IF EXISTS kategorie;
DROP TABLE IF EXISTS nutzer;

-- Tabelle: nutzer
CREATE TABLE nutzer (
    nutzer_nr SERIAL PRIMARY KEY,
    vorname TEXT NOT NULL,
    name TEXT NOT NULL,
    universitaet TEXT,
    studiengang TEXT,
    geburtsdatum DATE CHECK (geburtsdatum <= CURRENT_DATE),
    avatar_farbe TEXT,
    bio TEXT
);

-- Tabelle: kategorie
CREATE TABLE kategorie (
    kategorie_nr SERIAL PRIMARY KEY,
    bezeichnung TEXT UNIQUE NOT NULL
);

-- Tabelle: aktivitaet
CREATE TABLE aktivitaet (
    aktivitaet_nr SERIAL PRIMARY KEY,
    titel TEXT NOT NULL,
    beschreibung TEXT,
    kategorie_nr INT,
    datum DATE NOT NULL CHECK (datum >= CURRENT_DATE),
    uhrzeit TIME NOT NULL,
    ort TEXT NOT NULL,
    max_anzahl INT CHECK (max_anzahl > 0),
    ersteller_nr INT NOT NULL,

    CONSTRAINT fk_aktivitaet_kategorie
        FOREIGN KEY (kategorie_nr)
        REFERENCES kategorie(kategorie_nr)
        ON DELETE SET NULL,

    CONSTRAINT fk_aktivitaet_ersteller
        FOREIGN KEY (ersteller_nr)
        REFERENCES nutzer(nutzer_nr)
        ON DELETE CASCADE
);

-- Tabelle: bewertung
CREATE TABLE bewertung (
    nutzer_nr INT,
    aktivitaet_nr INT,
    bewertung INT NOT NULL CHECK (bewertung BETWEEN 1 AND 5),

    PRIMARY KEY (nutzer_nr, aktivitaet_nr),

    CONSTRAINT fk_bewertung_nutzer
        FOREIGN KEY (nutzer_nr)
        REFERENCES nutzer(nutzer_nr)
        ON DELETE CASCADE,

    CONSTRAINT fk_bewertung_aktivitaet
        FOREIGN KEY (aktivitaet_nr)
        REFERENCES aktivitaet(aktivitaet_nr)
        ON DELETE CASCADE
);

-- Tabelle: interesse
CREATE TABLE interesse (
    nutzer_nr INT,
    kategorie_nr INT,

    PRIMARY KEY (nutzer_nr, kategorie_nr),

    CONSTRAINT fk_interesse_nutzer
        FOREIGN KEY (nutzer_nr)
        REFERENCES nutzer(nutzer_nr)
        ON DELETE CASCADE,

    CONSTRAINT fk_interesse_kategorie
        FOREIGN KEY (kategorie_nr)
        REFERENCES kategorie(kategorie_nr)
        ON DELETE CASCADE
);

-- Tabelle: kommentar
CREATE TABLE kommentar (
    kommentar_nr SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    zeitstempel TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nutzer_nr INT NOT NULL,
    aktivitaet_nr INT NOT NULL,

    CONSTRAINT fk_kommentar_nutzer
        FOREIGN KEY (nutzer_nr)
        REFERENCES nutzer(nutzer_nr)
        ON DELETE CASCADE,

    CONSTRAINT fk_kommentar_aktivitaet
        FOREIGN KEY (aktivitaet_nr)
        REFERENCES aktivitaet(aktivitaet_nr)
        ON DELETE CASCADE
);

-- Tabelle: teilnahme
CREATE TABLE teilnahme (
    nutzer_nr INT,
    aktivitaet_nr INT,
    anmeldedatum DATE DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('angemeldet', 'abgesagt', 'teilgenommen')),

    PRIMARY KEY (nutzer_nr, aktivitaet_nr),

    CONSTRAINT fk_teilnahme_nutzer
        FOREIGN KEY (nutzer_nr)
        REFERENCES nutzer(nutzer_nr)
        ON DELETE CASCADE,

    CONSTRAINT fk_teilnahme_aktivitaet
        FOREIGN KEY (aktivitaet_nr)
        REFERENCES aktivitaet(aktivitaet_nr)
        ON DELETE CASCADE
);

INSERT INTO kategorie (bezeichnung) VALUES
('sport'),
('kultur'),
('essen'),
('lernen'),
('outdoor'),
('gaming'),
('musik'),
('kunst');

INSERT INTO nutzer (vorname, name, universitaet, studiengang, geburtsdatum, avatar_farbe, bio) VALUES
('Max', 'Müller', 'Uni Frankfurt', 'Informatik', '1998-05-12', 'blau', 'Mag Sport und Programmieren'),
('Anna', 'Schmidt', 'Uni Mainz', 'BWL', '1999-08-23', 'rot', 'Foodie und Reisefan'),
('Lukas', 'Weber', 'TH Darmstadt', 'Maschinenbau', '1997-02-11', 'grün', 'Outdoor begeistert'),
('Sophie', 'Klein', 'Uni Frankfurt', 'Medienwissenschaft', '2000-11-30', 'gelb', 'Kunst und Musik'),
('Tim', 'Becker', 'Uni Gießen', 'Wirtschaftsinformatik', '1998-03-14', 'lila', 'Gaming Nerd'),
('Laura', 'Fischer', 'Uni Frankfurt', 'Psychologie', '1999-06-18', 'orange', 'Liebt Yoga und Lesen'),
('Felix', 'Wagner', 'Uni Mainz', 'Physik', '1996-09-05', 'türkis', 'Technikverrückt'),
('Julia', 'Hoffmann', 'TH Darmstadt', 'Design', '2001-01-20', 'pink', 'Künstlerin');

INSERT INTO aktivitaet (titel, beschreibung, kategorie_nr, datum, uhrzeit, ort, max_anzahl, ersteller_nr) VALUES
('Fußball im Park', 'Freundschaftsspiel', 1, '2026-06-10', '15:00', 'Stadtpark Frankfurt', 10, 1),
('Museumsbesuch', 'Moderne Kunst Ausstellung', 2, '2026-06-12', '11:00', 'Städel Museum', 8, 4),
('Sushi Abend', 'Gemeinsam Sushi essen', 3, '2026-06-15', '19:00', 'Sakura Restaurant', 6, 2),
('Python Workshop', 'Einführung in Python', 4, '2026-06-20', '14:00', 'Uni Frankfurt', 15, 7),
('Wandern im Taunus', 'Tageswanderung', 5, '2026-06-22', '09:00', 'Taunus', 12, 3),
('LAN Party', 'Gaming Night', 6, '2026-06-25', '18:00', 'Studentenwohnheim', 10, 5),
('Live Konzert', 'Indie Band', 7, '2026-06-28', '20:00', 'Batschkapp', 20, 4),
('Malkurs', 'Acrylmalerei', 8, '2026-07-01', '17:00', 'Kunststudio', 8, 8);

INSERT INTO teilnahme (nutzer_nr, aktivitaet_nr, status) VALUES
(1, 1, 'angemeldet'),
(2, 1, 'angemeldet'),
(3, 1, 'teilgenommen'),
(4, 2, 'angemeldet'),
(5, 6, 'angemeldet'),
(6, 5, 'teilgenommen'),
(7, 4, 'angemeldet'),
(8, 8, 'angemeldet'),
(1, 4, 'angemeldet'),
(2, 3, 'teilgenommen');

INSERT INTO bewertung (nutzer_nr, aktivitaet_nr, bewertung) VALUES
(1, 1, 5),
(2, 1, 4),
(3, 1, 5),
(2, 3, 5),
(4, 2, 4),
(5, 6, 5),
(6, 5, 4),
(7, 4, 5);

INSERT INTO kommentar (text, nutzer_nr, aktivitaet_nr) VALUES
('War ein super Spiel!', 1, 1),
('Hat mega Spaß gemacht', 2, 1),
('Freue mich auf das Event!', 4, 2),
('Sehr lehrreich!', 1, 4),
('Top organisiert', 6, 5),
('Mega Stimmung!', 5, 6),
('Tolles Konzert!', 4, 7),
('Sehr entspannend', 8, 8);

INSERT INTO interesse (nutzer_nr, kategorie_nr) VALUES
(1, 1),
(1, 4),
(2, 3),
(2, 2),
(3, 5),
(4, 8),
(4, 7),
(5, 6),
(6, 1),
(7, 4),
(8, 8);