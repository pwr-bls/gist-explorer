# Gist Explorer

Prosta aplikacja z wykorzystaniem BackboneJs & MarionetteJs + NodeJS/Express demonstrująca przykładowy kod w ramach zadania rekrutacyjnego.

- prosty serwer/api do wymiany danych z githubem
- logowanie przez githuba
- pobieranie tokena w celu autoryzacji
- pobieranie danych zalogowanego Usera -> wyświetlenie loginu ->wyświetlenie na konsoli
- pobieranie danych o Gists-ach zalogowanego usera ->wyświetlenie na konsoli

- core apki pozwala na łatwe dodawanie nowych modułów (subapps)

- do tego napisałem kilka prostych testów w jasmine (jasmine + karma + phantomJS) dla subapps/login/view/login.view.js oraz subapps/login/controller/login.controller.js

przepraszam ale zabrakło mi czasu na warstwę wizualną

##Uruchmienie aplikacji 

npm install
gulp watch - z wykonaniem wszystkich testów / gulp watch-without-tests - bez testow

node server/app.js


ps. zastrzegam sobie, aby przekazany Wam kod był wykorzystany tylko na potrzeby rekrutacji.
Wykorzystanie jego fragmentów lub przekazanie innym osobom nie uczestniczącym w rekrutacji tylko za moją zgodą :)
