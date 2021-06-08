# Introduction

BaM – Bayesian Model fitting (Mansanarez et al., 2019) est un outil permettant le calage de modèles suivant une approche bayésienne. Pour un modèle donné, cette approche permet de combiner, de façon statistiquement rigoureuse, (1) la connaissance *a priori* que l’on est susceptible d’avoir sur les paramètres du modèle avec (2) l’information apportée par des données (incertaines ou non) de calage. BaM est un outil incluant déjà plusieurs modèles dont BaRatin permettant l’établissement de courbes de tarage hauteur-débit, différents modèles pour des courbes de tarage non univoques, et bien d’autres modèles. Si cet outil codé en Fortran offre une excellente rapidité de calcul et des possibilités de configurations très riches, il n’en reste pas moins difficile à déployer en raison de la configuration longue, fastidieuse et compliquée à travers de nombreux fichiers texte (voir Figure 1). Pour cette raison, une interface R (non graphique) – R étant un langage de programmation scientifique – a été créée par Benjamin Renard : le package RBaM. Cette interface R permet la création des fichiers de configuration avec quelques lignes de code R seulement. Si cela facilite grandement la configuration de BaM, cette approche requiert un minimum de connaissances en R. Une interface graphique apparaît donc nécessaire pour permettre à tou·te·s de pouvoir utiliser BaM.  L’objectif de cette courte note est de présenter BaMit (Figure 2), une interface graphique pour BaM, développée depuis début août 2020 à INRAE. BaMit est à la fois une interface graphique et une interface web, c’est-à-dire, qu’elle fonctionne dans un navigateur web (e.g. Firefox) et peut être déployée sur un site internet.

Parmi les modèles implémentés dans BaM, un en particulier est intéressant étant donné sa généricité. Il s’agit du modèle dénommé TextFile. Ce dernier permet de définir une ou plusieurs équations « à la main » qui constitue(nt) alors le modèle. Ce modèle a été choisi pour démarrer le développement de BaMit. A ce jour seul ce modèle a été « interfacé », mais d’autres modèles pourront, dans le futur, l’être également. Cependant, seule la définition du modèle est spécifique au modèle choisi (i.e. BaRatin, TextFile, etc.). La définition des *a priori* des paramètres, la spécification des données de calage, etc., sont génériques et pourront être utilisées pour n’importe quel modèle qui serait ultérieurement implémenté dans BaMit.
Ce document est composé d’une présentation générale puis détaillée pas-à-pas de BaMit et des perspectives de développement futurs. Il suppose une connaissance générale de BaM.

# Présentation générale
BaMit a été développé avec pour objectif d’être intuitif, simple à prendre en main tout en étant relativement complet pour la configuration de BaM. En l’état, BaMit permet :
 * de définir un modèle TextFile ;
 * de spécifier les *a priori* associés aux paramètres ;
 * d’importer (et de visualiser) des jeux de données et de spécifier les données de calage ;
 * de modifier, si besoin, les modèles d’erreurs associés aux variables de sortie ;
 * de lancer BaM pour ajuster le modèle ;
 * de visualiser les distributions des paramètres *a posteriori*, c’est-à-dire après calage, de visualiser et de télécharger les fichiers résultats de calibration ;
 * de prédire les valeurs des variables de sortie à partir du modèle calé et des valeurs des variables d’entrées (plusieurs jeux de données peuvent être utilisés pour cela). Les résultats de ces prédictions peuvent être ensuite téléchargés.
Une présentation pas-à-pas de ces différents aspects de BaMit est proposée dans la section qui suit sous la forme d’un tutoriel.



# Présentation pas-à-pas
Pour la présentation de l’interface graphique web BaMit, nous avons choisis un modèle fictif simple (et inutil) permettant d’illustrer efficacement les différents aspects de BaMit. Il s’agit d’un modèle linéaire `y=a*x+b où` *a priori* `a` vaut 10 +/- 5 (intervalle de confiance à 95%) et `b` est compris entre -5 et +5. Les données utilisées sont également complétement fictives.

## Création et chargement d’un projet BaM
Au lancement de BaMit, l’utilisateur a le choix entre créer un nouveau projet (1) ou charger un projet préalablement enregistré (2). Notez également qu’il est possible de changer de langue à tout moment (3).

Commençons par la création d’un nouveau projet. A ce stade de développement de BaMit, seul le modèle TextFile est implémenté (1).

Définissons le nom du projet.

## Projet BaM
Le projet est maintenant créé. Sur le côté gauche vous avez la possibilité de sauvegarder, réinitialiser, supprimer ou renommer le projet (1). Il existe également une section vous indiquant le contenu du projet et permettant de naviguer entre les différentes « boîtes » (2). Et bien sûr, à droite, vous avez les différents « boîte » (seulement une apparaissante pour l’instant) permettant la configuration de BaM (3). Le terme boîte est utilisé pour désigner les différentes « onglets » ou « sections » permettant de configurer différent aspects de BaM.
 
## Définition d’un modèle TextFile
Nous pouvons maintenant configurer le modèle TextFile avec le modèle fictif y=ax+b où a et b sont des paramètres et x et y laes variables d’entrée et de sortie, respectivement. Ceci se fait dans l’onglet « Définition du modèle TextFile » avec, à droite, la définition des équations (1) et à gauche, l’identification des paramètres et des variables d’entrées (2), c’est-à-dire la différentiation des paramètres des variables d’entrée. Car si les différents termes de l’équation sont automatiquement détectés, il incombe à l’utilisateur de définir lui-même qu’elles sont les variables d’entrée (en général moins nombreuses que les paramètres). A la suite de la spécification du modèle, il ne reste qu’à appliquer ce modèle (3) pour continuer la configuration de BaM.
 
Après avoir cliqué sur « appliquer » plusieurs onglets sont ajoutés comme vous pouvez le voir dans la section « contenu du projet », à gauche.
 
## Spécification des *a priori* des paramètres
Pour chaque paramètre, il est nécessaire de spécifier (1) une valeur initiale, (2) une distribution et (3) les paramètres de la distribution (s’il y en a).
 
Pour notre exemple, nous spécifions les valeurs suivantes :
 * paramètre a : une valeur initiale de 10 et une distribution gGaussienne de moyenne 10 et d’écart-type 2.5 ;
 * paramètre b : une valeur initiale de 0 et une distribution uUniforme avec pour bornes inférieures et supérieures, -5 et +5, respectivement.

 
## Spécification des données de calage
Pour spécifier les données de calage, il est nécessaire d’importer un ou plusieurs jeux de données. Il est possible de faire un « drag & drop » ou bien de rechercher sur son ordinateur le(s) fichier(s) (fichier texte ; de nombreux formats sont possibles).

Plusieurs fichiers textes peuvent être chargés (1). Et il est ensuite possible de supprimer (du projet) un fichier importé (2) et d’avoir un aperçu du contenu du fichier (3). 

Dans cet onglet, à droite, il est ensuite nécessaire de préciser pour chaque variable d’entrée et chaque variable de sortie, quelle est la colonne/variable du ou des fichiers importés qu’il convient de lui attribuer. Notez que si les noms de colonne dans les jeux de données correspondent aux noms des variables d’entrée/sortie, ces associations sont automatiquement établies.
 
## Calibration du modèle
Avant la calibration du modèle, une étape optionnelle est la modification des modèles d’erreur structurelle/restante associés aux variables de sortie (boîte « Modèle(s) des erreurs restantes »). Ces modèles d’erreur permettent de rendre compte des erreurs associées au modèle lui-même (erreurs qui ne peuvent pas être expliqué par les incertitudes des données de calage). Il est recommandé de laisser les valeurs par défaut.
La calibration du modèle se fait dans la boîte « Calibration ». Cette étape consiste à caler le modèle en exécutant BaM en cliquant sur « Exécuter BaM : calibration ».

Ensuite, il suffit d’attendre la fin des calculs de BaM (quelques secondes en général), une barre de progression étant affichée.
 
## Résultat de la calibration (en cours de développement)
A la fin de la calibration du modèle par BaM, un nouvel onglet, présentant les résultats et permettant de les télécharger, est ajouté. Il comporte 3 onglets : paramètres, fichiers résultats et log de BaM.

### Paramètre
L’onglet « Paramètres » permet de visualiser les « traces » (série d’échantillons) des simulations MCMC pour chaque paramètre ou bien les densités *a posteriori*.

### Fichiers résultats
Cet onglet permet d’avoir un aperçu des différents fichiers résultats (1) et de télécharger les fichiers résultats (2).

### Log de BaM
Cet onglet permet de voir les sorties de la console de BaM (comme si BaM avait été exécuté en ligne de commande). Cet onglet est surtout utile en cas de plantage de BaM pour en identifier la cause.
 
## Prédictions (en cours de développement)
Une autre boîte générale a été ajouté après la fin de la calibration du modèle : la boîte « Prédiction » qui permet de créer des prédictions. Dans la terminologie de BaM, une prédiction correspond à la prédiction des variables de sorties et de leurs incertitudes à partir du modèle calé et de données d’entrée que l’utilisateur spécifie. Chaque prédiction possède un nom, et a sa propre boîte dans le contenu du projet.

Pour chaque prédiction, il est nécessaire (1) d’importer un ou plusieurs jeux de données, (2) de préciser le fichier et la colonne à associer à chaque variable d’entrée et enfin (3) de préciser le type de prédiction à effectuer avant de (4) lancer BaM pour faire la prédiction. 
