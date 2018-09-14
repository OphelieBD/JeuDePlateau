// Création du prototype Joueur (qui seront créés dans le générateur joueur grâce au prototype joueur ci-dessous)
var Joueur = {
	nom: "",
	sante: 100,
	arme: "",
	ligne: 0,
	colonne: 0,
	visuel: "",
	nbCasesPotentielles: 3, // Nb de cases potentielles par direction (3 ers la gauche, 3 vers la droite, 3 vers le haut, 3 vers le bas)
	statut: "",
	adversaire: null,

	// Renvoie les infos du joueur (prêt à être affiché en HTML)
	afficherInfosJoueur: function()
	{
		if (this.sante <= 0) // si le joueur n'a plus de point de vie (parfois en négatif selon le type d'arme qui l'a tué), on indique que c'est 0
		{
			this.sante = 0;
		}
		return "<img src='" + this.visuel + "' class='imageJoueur'/><img src='" + this.arme.typeDArme.visuel + "' class='imageArme'/><br/>" 
				+ "points de vie: " + this.sante
				+ "<br/><br/><progress value='" + this.sante + "' max='100' min='0'><progress>";
	},

	// Fonction récursive: cases potentiellement cliquables par le joueur lorsque c'est à son tour 
	// avec en params les coordonnées du joueur, le nb de case à surbriller, si ligne ou colonne, 
	// et si plus ou moins (donne les directions)
	colorerCasesPotentielles(ligneCase, colonneCase, nbAColorer, ligneOuColonne, plusOuMoins) 
	{
		if (ligneCase >= 0 && ligneCase < Plateau.nbLignes && colonneCase >= 0 && colonneCase < Plateau.nbColonnes) // si la case est bien dans la grille
		{

			if (Plateau.grille[ligneCase][colonneCase].joueur === null) // si la case ne contient pas de joueur
			{
				Plateau.grille[ligneCase][colonneCase].surbrillance = true; // on modifie son attribut "surbrillance"
			}
			else
			{ // rien, on ne met pas en surbrillance la case du joueur
			}

			// si le nb donné est au moins de 1, que la case n'est pas noire et qu'elle n'a pas de joueur ou alors le joueur actuel
			// selon la direction donnée en paramètre on va appeler cette fonction avec les mêmes direction en décrémentant le nb de cases à colorer
			// pour toucher toutes les cases de chaque direction dans un périmètre de 3 cases.
			if (nbAColorer >= 1 && Plateau.grille[ligneCase][colonneCase].type !== "caseNoire" && (Plateau.grille[ligneCase][colonneCase].joueur === null || Plateau.grille[ligneCase][colonneCase].joueur === this)) 
			{
				if (ligneOuColonne === "ligne") 
				{
					if (plusOuMoins === "plus") 
					{
						this.colorerCasesPotentielles(parseInt(ligneCase)+1, parseInt(colonneCase), nbAColorer-1, "ligne", "plus");
					}
					else // cad si plusOuMoins = "moins" 
					{
						this.colorerCasesPotentielles(parseInt(ligneCase)-1, parseInt(colonneCase), nbAColorer-1, "ligne", "moins");
					}
				}
				else // cad si ligneOuColonne = "colonne"
				{
					if (plusOuMoins === "plus") 
					{
						this.colorerCasesPotentielles(parseInt(ligneCase), parseInt(colonneCase)+1, nbAColorer-1, "colonne", "plus");
					}
					else // cad si plusOuMoins = "moins" 
					{
						this.colorerCasesPotentielles(parseInt(ligneCase), parseInt(colonneCase)-1, nbAColorer-1, "colonne", "moins");
					}
				}
			}
			else
			{ // rien
			}
		}
		else
		{ // rien, en dehors de la grille
		}
	},

    // Quand c'est à son tour, le joueur voit apparaitre les cases potentielles (cf fonction "jouer" qui appelle la fonction
    // colorerCasesPotentielles + celle-çi) et va cliquer sur l'une d'elle
	enregistrerDeplacementsPossibles: function() 
	{
		let joueur = this;
		$('.surbrillant').click(function(){ // au clic sur une case en surbrillance
			joueur.seDeplacer(this.dataset.ligne, this.dataset.colonne);
		});
	},

	// Fonction appelée lorsque le joueur a cliqué sur une case en surbrillance
	// Ca va donc le déplacer et effacer les cases en surbrillance
	seDeplacer: function(coordonneeLigne, coordonneeColonne)
	{
		Plateau.grille[this.ligne][this.colonne].joueur = null; // Je supprime le joueur de la case sur laquelle il est puisqu'il va bouger
		this.ligne = coordonneeLigne; // Je modifie les coordonnées du joueur par celles de la case cliquée
		this.colonne = coordonneeColonne;
		Plateau.grille[this.ligne][this.colonne].joueur = this; // je positionne le joueur sur case cliquée

		// Si la nouvelle case du joueur est armée, on appelle la fonction changerArme en lui donnant en params l'arme de la case etl'arme du joueur
		if (Plateau.grille[this.ligne][this.colonne].arme !== null) 
		{
			this.changerArme(Plateau.grille[this.ligne][this.colonne].arme, this.arme);
		}
		else
		{ // si l'arme n'a pas d'arme, on ne s'en occupe pas
		}

		for (let i = 0; i < Plateau.grille.length; i++) // pour chaque case, j'enlève la surbrillance
		{
			for (let j = 0; j < Plateau.grille[i].length; j++) 
			{
				Plateau.grille[i][j].surbrillance = false;
				$(".armeEtJoueur").css("background-color", "#558FA4 !important"); // je met la case dans sa couleur initiale
				$(".armeEtJoueur").css("box-shadow", "3px 3px 3px #558FA4 !important");
			}
		}

		Plateau.afficherPlateau(); // je réaffiche le tableau actualisé
		GestionnaireJoueurs.afficherLegendeJoueurs(); // on demande l'actualisation des infos des joueurs sur l'interface car le joueur peut avoir une nouvelle arme
		
		this.verifierSiAdversaireAProximite(); // on regarde s'il y a un adversaire à proximité en appelant la fonction prévue pour ça
		if (this.adversaire === null) // si pas d'adversaire à proximité
		{
			GestionnaireJoueurs.faireJouerJoueurSuivant(); // On change de tour, c'est à l'autre joueur de jouer
		}
		else // si le joueur a un adversaire à proximité, un combat est enclenché
		{
			let self = this;
			$("#debutCombat").fadeIn("slow");
			function effacerMessageCombat(){
				$('#debutCombat').fadeOut("slow");
				self.demanderAvisJoueurActuel();
			};
			setTimeout(effacerMessageCombat, 2000);
		}
	},

	// fonction permettant d'échanger l'arme du joueur et celle de la case passées en paramètres
	changerArme: function(armeADonnerAuJoueur, armeADonnerALaCase) 
	{
		this.arme = armeADonnerAuJoueur; // l'arme du joueur devient celle de la case
		Plateau.grille[this.ligne][this.colonne].arme = armeADonnerALaCase; // la case prend l'ancienne arme du joueur
	},

	// Fonction qui permet de voir si le joueur actuel a un adversaire côte à côte ou l'un en dessous de l'autre:
	// si les cases du dessus, du dessous, de la gauche ou de la droite existent et qu'il y a un joueur dessus,
	// alors on appelle la fonction d'attaque en envoyant en paramètre l'objet joueur de l'adversaire
	verifierSiAdversaireAProximite: function()
	{
		if ((parseInt(this.ligne)+1) >= 0 && (parseInt(this.ligne)+1) < Plateau.nbLignes && Plateau.grille[parseInt(this.ligne)+1][parseInt(this.colonne)].joueur !== null)
		{
			this.adversaire = Plateau.grille[parseInt(this.ligne)+1][parseInt(this.colonne)].joueur;
			this.adversaire.adversaire = this;
		}
		else if ((parseInt(this.ligne)-1) >= 0 && (parseInt(this.ligne)-1) < Plateau.nbLignes && Plateau.grille[parseInt(this.ligne)-1][parseInt(this.colonne)].joueur !== null)
		{
			this.adversaire = Plateau.grille[parseInt(this.ligne)-1][parseInt(this.colonne)].joueur;
			this.adversaire.adversaire = this;
		}
		else if ((parseInt(this.colonne)+1) >= 0 && (parseInt(this.colonne)+1) < Plateau.nbColonnes && Plateau.grille[parseInt(this.ligne)][parseInt(this.colonne)+1].joueur !== null)
		{
			this.adversaire = Plateau.grille[parseInt(this.ligne)][parseInt(this.colonne)+1].joueur;
			this.adversaire.adversaire = this;
		}
		else if((parseInt(this.colonne)-1) >= 0 && (parseInt(this.colonne)-1) < Plateau.nbColonnes && Plateau.grille[parseInt(this.ligne)][parseInt(this.colonne)-1].joueur !== null)
		{
			this.adversaire = Plateau.grille[parseInt(this.ligne)][parseInt(this.colonne)-1].joueur;
			this.adversaire.adversaire = this;
		}
		else
		{ // rien, pas d'autres case à vérifier, aucun adversaire à proximité donc l'attribut adversaire reste null
		}
	},

	demanderAvisJoueurActuel: function() // Si combat, on demande l'avis du joueur actuel s'il veut attaquer l'adversaire ou se défendre
	{
		let self = this;
		$("#nomDuJoueur").empty();
		if (this.nom === "joueur1") // On ajoute le nom du joueur concerné dans la question
		{
			$("#nomDuJoueur").append("Mario");
		}
		else
		{
			$("#nomDuJoueur").append("Luigi");
		}
		$("#question").fadeIn(); // on fait apparaître la question
		$("#attaquer").click(function(){ // si le joueur clique sur attaquer
			$("#question").fadeOut();
			$('#attaquer').unbind("click");
			$('#defendre').unbind("click");
			self.attaquerAdversaire();
		});
		$("#defendre").click(function(){ // si le joueur choisit de se défendre
			$("#question").fadeOut();
			$('#defendre').unbind("click");
			$('#attaquer').unbind("click");
			self.seDefendreContreAdversaire();
		});
	},

	attaquerAdversaire: function()
	{
		this.statut = "attaquer";
		$("." + this.adversaire.nom).fadeOut();
		$("." + this.nom).fadeOut();
		$("." + this.nom).empty();
		$("." + this.adversaire.nom).empty();
		$("." + this.adversaire.nom).fadeIn().css("display", "inline-bloc");
		let joueur = "";
		if (this.adversaire.nom === "joueur1") // J'indique le nom des personnages pour les marquer dans l'interface plus tard
		{
			joueur = "Mario";
		}
		else
		{
			joueur = "Luigi";
		}
		if (this.adversaire.statut === "défendre") // si l'adversaire s'est précédemment défendu,
		{
			this.adversaire.sante -= (this.arme.typeDArme.degats/2); // on fait perdre la moitié de points de l'arme à l'adversaire
			$("." + this.adversaire.nom).append(joueur + " perd " + this.arme.typeDArme.degats/2 + " points de vie !"); // on affiche sur l'interface
		}
		else
		{
			this.adversaire.sante -= this.arme.typeDArme.degats; // on fait perdre l'intégralité des points de l'arme à l'adversaire
			$("." + this.adversaire.nom).append(joueur + " perd " + this.arme.typeDArme.degats + " points de vie !"); // on affiche sur l'interface
		}

		if (this.adversaire.sante <= 0) // si l'adversaire est mort, on arrête le combat
		{
			if (this.adversaire.nom === "joueur1") // On ajoute le nom du joueur concerné dans la question
			{
				$("#nomPerdant").text("Mario");
			}
			else
			{
				$("#nomPerdant").text("Luigi");
			}
			$("#finCombat").fadeIn("slow");
		}
		else // si l'adversaire est encore en vie, c'est à son tour
		{
			GestionnaireJoueurs.faireJouerJoueurSuivant(); // on passe au tour de l'autre joueur
		}

		GestionnaireJoueurs.afficherLegendeJoueurs(); // on demande l'actualisation des infos des joueurs sur l'interface

	},

	seDefendreContreAdversaire: function()
	{
		this.statut = "défendre";
		GestionnaireJoueurs.faireJouerJoueurSuivant();
	},

	jouer: function() // appel de cette fonction quand c'est au tour du joueur
	{
		$("#joueur-"+GestionnaireJoueurs.indexJoueurActuel).addClass("joueurActuel");

		if (this.adversaire === null) // s'il n'y a pas d'adversaire, c'est qu'on est pas en mode combat
		{
			this.colorerCasesPotentielles(this.ligne, this.colonne, this.nbCasesPotentielles, "ligne", "plus");
			this.colorerCasesPotentielles(this.ligne, this.colonne, this.nbCasesPotentielles, "ligne", "moins");
			this.colorerCasesPotentielles(this.ligne, this.colonne, this.nbCasesPotentielles, "colonne", "plus");
			this.colorerCasesPotentielles(this.ligne, this.colonne, this.nbCasesPotentielles, "colonne", "moins");
			Plateau.afficherPlateau();
			this.enregistrerDeplacementsPossibles();
		}
		else // si adversaire, mode combat donc on demande au joueur s'il veut attaquer ou se défendre
		{
			this.demanderAvisJoueurActuel();
		}
	}
};

// Création du prototype GestionnaireJoueur qui permettra d'instancier les 2 joueurs du jeu et de coordonner les tours
var GestionnaireJoueurs = {
	nbJoueurs: 2,
	distanceMinimale: 2, // pour faire en sorte que les joueurs ne démarrent pas le jeu côte à côte, ce qui enclencherai le mode combat
	tableauJoueurs: [], // regroupe les objets de chaque joueur
	indexJoueurActuel: 0,  // Pour la mise en place du tour par tour

	creerJoueurs: function()
	{
		this.indexJoueurActuel = 0; 
		this.tableauJoueurs = []; // je vide le tableau des joueurs (pour quand on recommence une nouvelle partie)
		// si la case aléatoire piochée n'est ni noire ni armée, alors on créé un joueur et on lui attribue cette case
		let i = 0;
		while (i < this.nbJoueurs) // on créé des joueurs jusqu'à ce qu'on arrive au nb de joueurs (2)
		{
			let ligneAleatoire = Math.floor(Math.random()*Plateau.nbLignes); // On pioche aléatoirement une ligne et une colonne pour créer les coordonnées d'une case
			let colonneAleatoire = Math.floor(Math.random()*Plateau.nbColonnes);

			// si la case aléatoire est vide (sans arme, blanche et sans joueur)
			// et si l'autre joueur est à plus d'une case de distance des nouvelles coordonnées (fonction renvoie true), on y créé un autre joueur
			if (Plateau.grille[ligneAleatoire][colonneAleatoire].estVide() && this.joueursAssezLoin(ligneAleatoire, colonneAleatoire)) 
			{
				this.tableauJoueurs.push(Plateau.grille[ligneAleatoire][colonneAleatoire].joueur = Object.create(Joueur));
				Plateau.grille[ligneAleatoire][colonneAleatoire].joueur.ligne = ligneAleatoire;
				Plateau.grille[ligneAleatoire][colonneAleatoire].joueur.colonne = colonneAleatoire;	
				i++;
			}
			else
			{ //case noire ou armée, on ne la donne donc pas au joueur
			}
		}

		// On donne un nom et un visuel aux 2 joueurs créés
		this.tableauJoueurs[0].nom = "joueur1";
		this.tableauJoueurs[0].visuel = "img/mario.png";
		this.tableauJoueurs[0].arme = GestionnaireArmes.creerArmeJoueur();
		this.tableauJoueurs[1].nom = "joueur2";
		this.tableauJoueurs[1].visuel = "img/luigi.png";
		this.tableauJoueurs[1].arme = GestionnaireArmes.creerArmeJoueur();
	}, 	

	joueursAssezLoin: function(ligneAleatoire, colonneAleatoire)
	{
		let assezLoin = true; // variable utile pour éviter que les joueurs ne soient générés côte à côte

		for (let j = 0; j < this.tableauJoueurs.length; j++) // pour chaque joueur créé
		{
			// On compare les coordonnées du joueur déjà créé (qui est dans tableau) avec les nouvelles coordonnées générée aléatoirement passés en paramètres), si + petit que 2 (cases), c'est pas bon 
			if (Math.abs(this.tableauJoueurs[j].colonne - colonneAleatoire) < this.distanceMinimale && Math.abs(this.tableauJoueurs[j].ligne - ligneAleatoire) < this.distanceMinimale)
			{
				assezLoin = false;
			}
			else
			{ // Rien à faire, la variable assezLoin reste true, 
			}
		}
		return assezLoin;
	},

	afficherLegendeJoueurs: function() // affiche les joueurs et leurs caractéristiques sur l'interface à côté du plateau
	{

		$("#joueur-0").empty();// on vide le div de la légende des joueurs pour éviter son apparition en plusieurs exemplaires
		$("#joueur-1").empty();// on vide le div de la légende des joueurs pour éviter son apparition en plusieurs exemplaires

		for (let i = 0; i < this.tableauJoueurs.length; i++) 
		{
			$("#joueur-"+i).append(this.tableauJoueurs[i].afficherInfosJoueur());
		}
	},

	determinerJoueurSuivant: function() 
	{
		if (this.indexJoueurActuel !== this.tableauJoueurs.length-1) // si le joueur n'est pas le dernier joueur, on incrémente la variable
		{
			this.indexJoueurActuel++;
		}
		else // si le joueur est le dernier, on remet à 0 (= au tour du premier joueur à nouveau)
		{
			this.indexJoueurActuel = 0;
		}
		return this.indexJoueurActuel;
	},

	faireJouerJoueurSuivant: function() // fonction qui mets en place le tour par tour
	{
		$("#joueur-"+this.indexJoueurActuel).removeClass("joueurActuel");
		this.determinerJoueurSuivant();
		this.tableauJoueurs[this.indexJoueurActuel].jouer(); // appelle la fonction jouer() du prochain joueur
	}
};
