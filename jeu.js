function demarrerLeJeu() // mise en place du plateau, des joueurs et des armes
{
	Plateau.creerUnPlateauCorrect();
	GestionnaireArmes.creerTypeArmes();
	GestionnaireArmes.creerArmesPlateau();
	GestionnaireArmes.afficherLegendeArmes();
	GestionnaireJoueurs.creerJoueurs();
	Plateau.afficherPlateau();
	GestionnaireJoueurs.afficherLegendeJoueurs();
};

demarrerLeJeu(); // lorsque l'on arrive sur l'interface, le jeu s'affiche

$("#commencer").click(function(){ // lorsque le joueur clique sur commencer, l'écran redevient normal et le 1er joueur peut jouer
	$("#ecranDebut").fadeOut("slow");
	GestionnaireJoueurs.tableauJoueurs[0].jouer(); // le premier joueur est invité à jouer
});

$("#recommencer").click(function(){ // lorsque la partie est terminée, on propose aux joueurs de recommencer le jeu
	$("#finCombat").fadeOut("slow");
	$(".joueur1").fadeOut();
	$(".joueur2").fadeOut();
	$("#ecranDebut").fadeIn();
	demarrerLeJeu();
});