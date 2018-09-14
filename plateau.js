// Création d'un prototype qui servira de modèle pour les cases
var Case = {
	type: "", // noir (inacessible) ou blanc (accessible)
	colonne: 0, // pour connaitre position et ID de la case
	ligne: 0,
	comptabilisee: false, // utile pour éviter que les cases noires rendent inaccessibles les cases blanches
	arme: null,
	joueur: null,
	surbrillance: false,

	estVide: function() //permet de savoir si la case est vide,  sans arme et sans joueur en renvoyant "true".
	{
		return this.type === "caseBlanche" && this.arme === null && this.joueur === null;
	}
};

// Création de l'objet plateau/grille du jeu qui génère les cases
var Plateau = {
	nbLignes: 10,
	nbColonnes: 10,
	nbCasesNoires: 12,
	grille: [],	
	casesAccessibles: 0,

	creerLignes: function()
	{
		grille: new Array();
	},

	creerColonnes: function()
	{
		for (let i = 0; i < this.nbLignes; i++) 
		{
			this.grille[i] = new Array();
		    for(let j = 0; j < this.nbColonnes; j++)
		    {
		    	this.grille[i][j] = Object.create(Case);
		    	this.grille[i][j].ligne = i;
		    	this.grille[i][j].colonne = j;
		    	this.grille[i][j].type = "caseBlanche"; // Couleur par défaut
		    }
		}
	},

	creerCasesNoires: function()
	{
		let i = 0;
		while (i < this.nbCasesNoires)
		{
			let ligneAleatoire = Math.floor(Math.random()*this.nbLignes); // On pioche aléatoirement un nb pour la ligne et un pour la colonne afin de créer les coordonnées d'une case
			let colonneAleatoire = Math.floor(Math.random()*this.nbColonnes);
			if (this.grille[ligneAleatoire][colonneAleatoire].type !== "caseNoire") 
			{
				this.grille[ligneAleatoire][colonneAleatoire].type = "caseNoire";
				i++;
			}
			else
			{ //Rien ne se passe si la case tirée est déjà noire, la boucle recommence son tour
			}			
		}
	},

	compterCasesAccessibles: function(coordonneesCaseLigne, coordonneesCaseColonne) // Fonction récursive: Compte toutes les cases blanches qui sont accessibles, pour savoir si des cases noires bloquent des cases blanches
	{
		if (   coordonneesCaseColonne >= 0 // si les n° de coordonnées de la case envoyée en paramètre sont compris enntre 0 et 1 
			&& coordonneesCaseColonne < this.nbColonnes
			&& coordonneesCaseLigne >= 0 
			&& coordonneesCaseLigne < this.nbLignes
			&& this.grille[coordonneesCaseLigne][coordonneesCaseColonne].comptabilisee === false // si l'attribut comptabilisé est false
			&& this.grille[coordonneesCaseLigne][coordonneesCaseColonne].type !== "caseNoire") // et si c'est une case qui n'est pas noire
		{	
			this.grille[coordonneesCaseLigne][coordonneesCaseColonne].comptabilisee = true; // on modifie l'attribut puisqu'on comptabilise la case
			this.casesAccessibles++; // on incrémente 
			this.compterCasesAccessibles(coordonneesCaseLigne, coordonneesCaseColonne+1); // on appelle cette fonction avec les coordonnées des cases au dessus, en dessous, à gauche et à droite
			this.compterCasesAccessibles(coordonneesCaseLigne, coordonneesCaseColonne-1);
			this.compterCasesAccessibles(coordonneesCaseLigne+1, coordonneesCaseColonne);
			this.compterCasesAccessibles(coordonneesCaseLigne-1, coordonneesCaseColonne);
		}
		else
		{ // Rien, la fonction s'arrête
		}
	},

	recupererUneCaseBlanche: function() // Choisis au hasard une case blanche, pour mettre en paramètre de la fonction compterCasesAccessibles
	{
		let caseBlanche = "";
		while(caseBlanche === "") 
		{
			let ligneAleatoire = Math.floor(Math.random()*Plateau.nbLignes); // On pioche aléatoirement une ligne et une colonne pour créer les coordonnées d'une case
			let colonneAleatoire = Math.floor(Math.random()*Plateau.nbColonnes);
			if (Plateau.grille[ligneAleatoire][colonneAleatoire].estVide())
			{
				caseBlanche = Plateau.grille[ligneAleatoire][colonneAleatoire];
			}
			else
			{ // On recommence
			}
		}
		return caseBlanche;
	},

	creerPlateau: function()
	{
		this.creerLignes();
		this.creerColonnes();
		this.creerCasesNoires();
	},

	creerUnPlateauCorrect: function() // création du plateau avec des cases noires non bloquantes
	{
		do // J'appelle la méthode creerPlateau jusqu'à ce que les cases noires ne bloquent plus les cases blanches
		{
			this.creerPlateau(); // on crée le plateau
			let caseBlanche = this.recupererUneCaseBlanche(); // on appelle la fonction qui renvoit une case blanche au hasard
			this.casesAccessibles=0; // on ré-initialise le nb de cases accessibles à 0 (si ça ne marche pas pour le premier coup)
			this.compterCasesAccessibles(caseBlanche.ligne, caseBlanche.colonne); // on appelle la fonction de calcul avec en paramètre les coordonnées de la case blanche générée juste avant
		} 
		while (Plateau.casesAccessibles < Plateau.nbLignes*Plateau.nbColonnes-Plateau.nbCasesNoires); // jusqu'à ce qu'on ait un plateau où les cases noires ne bloquent rien
	},

	afficherPlateau: function()
	{
		
		$("#tableau").empty(); // je vide le div tableau pour éviter son apparition en plusieurs exemplaires
		for(let i = 0; i < this.nbLignes; i++) // pour chaque ligne
		{
			let ligne = "<tr>"; // je créé des lignes <tr> en HTML
			
			for(let j = 0; j < this.nbColonnes; j++) // pour chaque colonne
			{
				let elementDeLaCase = "";
				let caseJoueur = "pasDeJoueur";
				let caseArme = "pasDArme";
				let caseSurbrillance = "nonSurbrillant";
				if (this.grille[i][j].arme !== null) // Si la case est armée
				{
					caseArme = "arme";
					if (this.grille[i][j].joueur !== null) // si la case a une arme et un joueur
					{
						elementDeLaCase = "<img src='" + this.grille[i][j].joueur.visuel + "'/>"; // l'élément à afficher sera alors le joueur
						caseArme = "pasDArme";
					}
					else // cad si la case est armée mais n'a pas de joueur
					{
						elementDeLaCase = "<img src='" + this.grille[i][j].arme.typeDArme.visuel + "'/>"; // j'affiche le visuel de l'arme dans la case
					}
				}
				else if (this.grille[i][j].joueur !== null) // Si la case a un joueur dessus, alors j'affiche le visuel du joueur
				{
					elementDeLaCase = "<img src='" + this.grille[i][j].joueur.visuel + "'/>";
					caseJoueur = "caseJoueur";
				}
				else
				{ // rien, la case n'a ni arme, ni joueur
				}
				if (this.grille[i][j].surbrillance !== false && this.grille[i][j].type === "caseBlanche") // si la case est en surbrillance, on lui donne la classe surbrillant
				{
					caseSurbrillance = "surbrillant";
				}
				else
				{ // Rien, dans ce cas la variable caseSurbrillance reste telle quelle
				}
				
				ligne += "<td class=' case " + this.grille[i][j].type + " " + caseArme + " " + caseJoueur + " " + caseSurbrillance + "' data-ligne='" + this.grille[i][j].ligne + "' data-colonne='" + this.grille[i][j].colonne + "'>" + elementDeLaCase + "</td>"; // je rajoute les cases dans chaque ligne
			}

			ligne += "</tr>" // je ferme la balise
			$("#tableau").append(ligne); // j'ajoute le tout dans la table HTML
		}
	}
};
