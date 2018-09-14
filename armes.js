// Création d'un prototype de type d'arme
var TypeArme = {
	nom: "",
	degats: 0,
	visuel: ""
};

// Création du prototype d'arme
var Arme = {
	ligne: "",
	colonne: "",
	typeDArme: ""
};

// Création d'un gestionnaire de type d'armes qui va créer les 5 types d'armes puis va générer aléatoirement un certain nb d'armes qui apparaitront sur le plateau
var GestionnaireArmes = {
	tableauTypeArmes: [],

	creerTypeArmes: function() // Je créé les 5 types d'armes (la massue étant commune aux deux joueurs en début de partie)
	{
		var massue = Object.create(TypeArme); 
		massue.nom = "MASSUE";
		massue.degats = 10;
		massue.visuel = 'img/massue.png';

		var arbalette = Object.create(TypeArme);
		arbalette.nom = "ARBALETTE";
		arbalette.degats = 15;
		arbalette.visuel = 'img/arbalette.png';

		var machette = Object.create(TypeArme);
		machette.nom = "MACHETTE";
		machette.degats = 20;
		machette.visuel = 'img/machette.png';

		var sabre = Object.create(TypeArme);
		sabre.nom = "SABRE";
		sabre.degats = 27;
		sabre.visuel = 'img/sabre.png';

		var fusil = Object.create(TypeArme);
		fusil.nom = "FUSIL";
		fusil.degats = 30;
		fusil.visuel = 'img/fusil.png';

		// Je place mes différentes armes dans un tableau pour ensuite les afficher dans la légende en HTML grâce à une boucle
		tableauTypeArmes = [massue, arbalette, machette, sabre, fusil];
	},

	// Création des massues de départ pour les joueurs
	creerArmeJoueur: function()
	{
		let massueJoueur = Object.create(Arme);
		massueJoueur.typeDArme = tableauTypeArmes[0];
		return massueJoueur;
	},

	// Création aléatoire des autres armes qui seront présentes sur le plateau
	creerArmesPlateau: function()
	{
		let tableauTypeDArmesEnJeu = []; // Tableau qui regroupe toutes les armes présentes sur le plateau
		let nbArmes = Math.floor(Math.random()*(4-2+1)+2); //choix du nombre d'armes à faire apparaître sur le plateau
		let i = 0;
		while (i < nbArmes) // Création d'armes en fonction du nb choisi
		{
			let ligneAleatoire = Math.floor(Math.random()*Plateau.nbLignes); // On pioche aléatoirement un nb pour la ligne et un pour la colonne afin de créer les coordonnées d'une case
			let colonneAleatoire = Math.floor(Math.random()*Plateau.nbColonnes);
			let typeDArmeEnJeu = tableauTypeArmes[Math.floor(Math.random()*(tableauTypeArmes.length))]; // Type d'arme choisi aléatoirement

			// indexOf: renvoie l'indice de l'élèment ds le tableau, si pas d'élément dans tableau, renvoie -1
			if (Plateau.grille[ligneAleatoire][colonneAleatoire].estVide() && tableauTypeDArmesEnJeu.indexOf(typeDArmeEnJeu) === -1) // si case vide et si type d'arme pas encore sur plateau
			{
				Plateau.grille[ligneAleatoire][colonneAleatoire].arme = Object.create(Arme);
				Plateau.grille[ligneAleatoire][colonneAleatoire].arme.typeDArme = typeDArmeEnJeu;
				tableauTypeDArmesEnJeu.push(typeDArmeEnJeu);
				i++;
			}
			else
			{ // case déjà occupée (noire ou armée) donc on ne l'arme pas
			}
		}
	},

	afficherLegendeArmes: function()
	{
		$('#legende').empty();
		for (let i = 0; i < tableauTypeArmes.length; i++) 
		{
			$("#legende").append("<span class='legendeArme col-lg-2 col-md-4 col-sm-6 col-xs-12'><div class='col-lg-12'><img src='" + tableauTypeArmes[i].visuel + "' class='imageArme'></div><div class='col-lg-12'>" + tableauTypeArmes[i].degats + " pts de dégâts</div></span>");
		}
	}
};