# Présentation générale

*BaMit* est un site internet offrant une interface utilisateur au package [RBaM](https://github.com/BaM-tools/RBaM), un package *R* permettant de configurer et d'executer *BaM* (Bayesian Model fitting, Mansanarez et al., 2019), un outil permettant le calage de modèles suivant une approche bayésienne.
Pour un modèle donné, *BaM* permet de combiner, de façon statistiquement rigoureuse, (1) la connaissance *a priori* que l’on est susceptible d’avoir sur les paramètres du modèle avec (2) l’information apportée par des données (incertaines ou non) de calage.
*BaM* est un outil incluant déjà plusieurs modèles dont BaRatin permettant l’établissement de courbes de tarage hauteur-débit, différents modèles pour des courbes de tarage non univoques, et bien d’autres modèles.
Si cet outil codé en Fortran offre une excellente rapidité de calcul et des possibilités de configurations très riches, *BaMit* vise à rendre l'utilisation de *BaM* possible par tou·te·s.

<!-- ## Apercu de *BaMit* -->

*BaMit* a été développé avec pour objectif d’être intuitif, simple à prendre en main tout en étant relativement complet pour la configuration de *BaM*.
En l’état, *BaMit* permet :
 * de définir un modèle de type *TextFile* (voir plus loin), seul modèle actuellement implémenté dans *BaMit* ;
 * de spécifier les *a priori* associés aux paramètres ;
 * d’importer (et de visualiser) des jeux de données et de spécifier les données de calage ;
 * de modifier, si besoin, les modèles d’erreurs associés aux variables de sortie ;
 * de lancer *BaM* pour ajuster le modèle ;
 * de visualiser les distributions des paramètres *a posteriori*, c’est-à-dire après calage, de visualiser et de télécharger les fichiers résultats de calibration ;
 * de prédire les valeurs des variables de sortie à partir du modèle calé et des valeurs des variables d’entrées (plusieurs jeux de données peuvent être utilisés pour cela). Les résultats de ces prédictions peuvent être ensuite téléchargés.

<!-- ## Modèle de type *TextFile* -->


# Structure de *BaMit* et sommaire

*BaMit* fonctionne par projet.
Il est possible de créer un nouveau projet en choisissant un type de modèle ou en chargeant un projet que vous auriez préalablement enregistré.
Un projet est constitué d'un ensemble de **composants** qui permette de configurer *BaM*.
Ces **composants** sont: 
* **[Définition du modèle](#présentation-des-modèles)** : composant permettant de configurer le modèle choisie lors de la création du projet; c'est le seul composant qui est spécifique au type de modèle choisie.
* **[Paramètres](#paramètre)** : composant permettant de définit les distributions *a priori* des paramètres du modèle.
* **[Données de calage](#données-de-calage)** : composant permettant de spécifier les données à utiliser dans le calage du modèle. 
* **[Modèle(s) des erreurs réstantes](#modèles-des-erreurs-réstantes)** : composant permettant de modifier les modèles des erreurs restantes associées aux variables de sortie (optionnelle).
* **[Calibration](#calibration)** : composant permettant de lancer *BaM* pour calibrer le modèle.
* **[Résultat de la calibration de *BaM*](#résultat-de-la-calibration-de-bam)** : composant permettant de visualiser et de télécharger les résultat de la calibration du modèle
* **Prédiction(s)**
* **Prédiction**

# Présentation des modèles

A ce jour seul le modèle de type *TextFile* a été implémenté dans *BaMit* mais d’autres modèles pourront, dans le futur, l’être également (e.g. *BaRatin*, etc.).
Notez que dans *BaM* ainsi que dans *BaMit* seule la définition du modèle est spécifique au type de modèle choisie; la définition des *a priori* des paramètres, la spécification des données de calage, etc., sont génériques et s'appliquent pour n’importe quel modèle qui serait ultérieurement implémenté dans *BaMit*.

A la suite de la spécification du modèle, comme détaillé ci-dessous, il ne reste qu'à cliquer sur « appliquer » pour continuer la configuration de *BaM*.
Plusieurs composant sont ajoutés comme vous pouvez le voir dans la section « contenu du projet », à gauche de l'écran, où il vous est possible de naviguer entre les différents composants.

## Modèle de type *TextFile*

Parmi les modèles implémentés dans *BaM*, le modèle de type *TextFile* offre des possibilités assez variés.
Ce type de modèle permet de définir une ou plusieurs équations « à la main » qui constitue(nt) alors le modèle.

Prenons comme exemple le modèle `y=ax+b` où `a` et `b` sont des paramètres et `x` et `y` les variables d’entrée et de sortie, respectivement.
Dans le composant **Définition du modèle TextFile** vous pouvez:
* à droite, définir une ou plusieurs equations
* à gauche, identifier les paramètres et les variables d’entrées, c’est-à-dire différencier les paramètres des variables d’entrée. Si les différents termes de l’équation sont automatiquement détectés, il incombe à l’utilisateur de définir lui-même qu’elles sont les variables d’entrée (en général moins nombreuses que les paramètres).

![Modèle TextFile](help/model_textfile_fr.png)

# Paramètres

Ce composant vous permet de spécifier des *a priori* à chacun des paramètres de votre modèle.
Pour chaque paramètre, il est nécessaire de spécifier (1) une valeur initiale, (2) une distribution et (3) les paramètres de la distribution (s’il y en a).
 
Dans l'exemple ci-dessous, il y a deux paramètres :
 * paramètre `a` : une valeur initiale de 10 et une distribution Gaussienne de moyenne 10 et d’écart-type 5 ;
 * paramètre `b` : une valeur initiale de 0 et une distribution Uniforme avec pour bornes inférieures et supérieures, -10 et +10, respectivement.

![Paramètres](help/parameters_fr.png)

# Données de calage

Ce composant permet de spécifier les données de calage du modèle. 
Sur sa partie droite il permet d’importer un ou plusieurs jeux de données et sur sa partie gauche de spécifier les données à utiliser pour chaque variable d'entrée et de sortie.

Pour importer un fichier text, il est possible de faire un « drag & drop » ou bien de rechercher sur son ordinateur le(s) fichier(s) (fichier texte ; de nombreux formats sont possibles).
Plusieurs fichiers textes peuvent être chargés si nécessaire.
Pour chaque fichier, un apercu du contenu est disponible et leur suppression du projet est également possible.

Il est nécessaire de préciser pour chaque variable d’entrée et chaque variable de sortie, quelle est la colonne/variable du ou des fichiers importés qu’il convient de lui attribuer.
Notez que si les noms de colonne dans les jeux de données correspondent aux noms des variables d’entrée/sortie, ces associations sont automatiquement établies.
Pour les variables de sortie, il est également possible de spécifier des données incertaines en spécifiant des *moyennes* et des *écart-types* associés.

Dans l'exemple ci-dessous, un seul fichier (nommé « linear-with-noise.txt ») a été chargé.
Celui-ci fait 100 lignes et a deux colonnes `X` et `Y`.
Sur la droite, ces deux colonnes ont été affectées à la variable d'entrée `x` et la variable de sortie `y` respectivement.

![Données de calage](help/data_fr.png)

# Modèle(s) des erreurs réstantes

Ce composant permet de modifier les modèles des erreurs réstantes (ou erreurs structurelles) associées aux variables de sorties.
Ces modèles d’erreur permettent de rendre compte des erreurs associées au modèle lui-même (erreurs qui ne peuvent pas être expliqué par les incertitudes des données de calage). 
Il s'agit d'une étape optionnelle et il est recommandé de laisser les valeurs par défaut dans la plupart des cas.

# Calibration

Ce composant permet de lancer la calibration du modèle par *BaM* suivant la spécification du modèle faite dans les composant situés au dessus.
Avant de lancer la calibration, il est recommendé de sauvegarder votre projet en cliquant sur  « Sauvegarder le projet » sur le panneau situé à gauche de l'écran.

En cliquant sur  « Executer BaM: calibration » vous pouvez lancer les calculs de *BaM*.
Ceux-ci peuvent prendre plus ou mois de temps selon la compléxité du modèle et surtout la quantité de données de calage. 
Une barre de progression permet de suivre l'avancé des calcules.

# Résultat de la calibration de *BaM*

A la fin de la calibration du modèle par *BaM*, un nouvel onglet, présentant les résultats et permettant de les télécharger, est ajouté. Il comporte 3 onglets : 
* **Paramètres**:
L’onglet « Paramètres » permet de visualiser les « traces » (série d’échantillons) des simulations MCMC pour chaque paramètre ou bien les densités *a posteriori*.
* **Fichiers résultats**
Cet onglet permet d’avoir un aperçu des différents fichiers résultats et de télécharger les fichiers résultats, soit séparement, soit tous ensemble dans une archive .zip.
* **Log de *BaM***
Cet onglet permet de voir les sorties de la console de *BaM* (comme si *BaM* avait été exécuté en ligne de commande). Cet onglet est surtout utile en cas de plantage de *BaM* pour en identifier la cause.

![Résultat de la calibration](help/rescal_fr.png)

# Prédiction(s)

# Prédiction: \<nom de la prédiction\>