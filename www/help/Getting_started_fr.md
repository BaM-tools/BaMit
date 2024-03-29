<style> 
.link {
    height: 15px;
}
</style>

# Présentation générale

*BaMit* est un site internet offrant une interface utilisateur à [BaM](https://github.com/BaM-tools), un outil permettant le calage de modèles suivant une approche bayésienne. Pour un modèle donné, *BaM* permet de combiner, de façon statistiquement rigoureuse, (1) la connaissance *a priori* que l’on est susceptible d’avoir sur les paramètres du modèle avec (2) l’information apportée par des données (incertaines ou non) de calage.
*BaM* est un outil codé en Fortran, incluant déjà plusieurs modèles, offrant de nombreuses possibilités de configuration, mais dont la prise en main n'est pas triviale. *BaMit* vise à rendre l'utilisation de *BaM* possible par tou·te·s.

<!-- ## Apercu de *BaMit* -->

*BaMit* a été développé avec pour objectif d’être intuitif, simple à prendre en main tout en étant relativement complet pour la configuration de *BaM*.
En l’état, *BaMit* permet :
 * de définir un modèle simple en tapant son ou ses equation(s) (modèle de type *TextFile* (voir plus loin), seul modèle actuellement implémenté dans *BaMit*) ;
 * de spécifier les *a priori* associés aux paramètres ;
 * d’importer (et de visualiser) des jeux de données et de spécifier les données de calage ;
 * de modifier, si besoin, les modèles d’erreurs associés aux variables de sortie ;
 * de lancer *BaM* pour caler le modèle ;
 * de visualiser les distributions *a posteriori* des paramètres, c’est-à-dire après calage, de visualiser et de télécharger les fichiers résultats de calibration ;
 * de prédire les valeurs des variables de sortie à partir du modèle calé et des valeurs des variables d’entrées (plusieurs jeux de données peuvent être utilisés pour cela). Les résultats de ces prédictions peuvent être ensuite téléchargés.

<!-- ## Modèle de type *TextFile* -->


# Structure de *BaMit* et sommaire

*BaMit* fonctionne par projet.
Il est possible de créer un nouveau projet en choisissant un type de modèle ou en chargeant un projet que vous auriez préalablement enregistré.
Un projet est constitué d'un ensemble de **composants** qui permettent de configurer *BaM*.
Ces **composants** sont: 
* **[Définition du modèle](#mod)** : composant permettant de configurer le modèle choisi lors de la création du projet.
* **[Paramètres](#par)** : composant permettant de définir les distributions *a priori* des paramètres du modèle.
* **[Données de calage](#dat)** : composant permettant de spécifier les données à utiliser pour le calage du modèle. 
* **[Modèle(s) des erreurs réstantes](#err)** : composant permettant de modifier les modèles des erreurs restantes associées aux variables de sortie (optionnel).
* **[Calibration](#cal)** : composant permettant de lancer *BaM* pour calibrer le modèle.
* **[Résultat de la calibration de *BaM*](#res)** : composant permettant de visualiser et de télécharger les résultat de la calibration du modèle
* **[Prédiction(s)](#mpred)**: composant permettant d'ajouter des expériences de prédiction.
* **[Prédiction](#pred)**: composant permettant de configurer une expérience de prédiction, d'éxecuter BaM pour lancer la prédiction et obtenir les résultats.

<div id='mod' style='height: 25px'> </div>

# Présentation des modèles

A ce jour seul le modèle de type *TextFile* a été implémenté dans *BaMit* mais d’autres modèles pourront, dans le futur, l’être également (e.g. *BaRatin*, etc.).
Notez que dans *BaM* ainsi que dans *BaMit* seule la définition du modèle est spécifique au type de modèle choisi; la définition des *a priori* des paramètres, la spécification des données de calage, etc., sont génériques et s'appliquent pour n’importe quel modèle qui serait ultérieurement implémenté dans *BaMit*.

A la suite de la spécification du modèle, comme détaillé ci-dessous, il ne reste qu'à cliquer sur « appliquer » pour continuer la configuration de *BaM*.
Plusieurs composant sont ajoutés comme vous pouvez le voir dans la section « contenu du projet », à gauche de l'écran, où il vous est possible de naviguer entre les différents composants.

## Modèle de type *TextFile*

Parmi les modèles implémentés dans *BaM*, le modèle de type *TextFile* offre des possibilités assez variées.
Ce type de modèle permet de définir une ou plusieurs équations « à la main » qui constitue(nt) alors le modèle.

Dans le composant **Définition du modèle TextFile** vous pouvez:
* à gauche, définir une ou plusieurs equations
* à droite, différencier les paramètres (valeurs inconnues à estimer) et les variables d’entrée (valeurs connues). Si les différents termes de l’équation sont automatiquement détectés, il incombe à l’utilisateur de définir lesquels sont des variables d’entrée.

Après la spécification du modèle, il suffit de cliquer sur *Appliquer* en bas à droite.

Pour illustrer ce composant, prenons comme exemple un modèle décrivant l'évolution de deux populations `P1` et `P2` d'une même espèce, en fonction du temps `t` et des températures `T1` et `T2` auxquelles les deux populations sont soumises: 
```
P1(t, T1) = K1/(1+((K1-P0)/P0)*exp(-r*T1*t))
P2(t, T2) = K2/(1+((K2-P0)/P0)*exp(-r*T2*t))
```
Dans ce modèle, `P1` et `P2` sont les 2 variables de sortie, `T1`, `T2` et `t` sont les 3 variables d'entrée, et les 4 paramètres sont `K1`, `K2` (taille maximale de chaque population), `P0` (population initiale) et `r` (facteur de croissance de l'espèce considérée). La figure ci-dessous illustre comment ce modèle serait défini dans le composant **Définition du modèle TextFile**.

![Modèle TextFile](./help/model_textfile_fr.png)

<div id='par' class="link"> </div>

# Paramètres

Ce composant vous permet de spécifier des *a priori* pour chacun des paramètres de votre modèle.
Pour chaque paramètre, il est nécessaire de spécifier (1) une valeur initiale, (2) une distribution et (3) les paramètres de la distribution (s’il y en a).
 
Dans l'exemple ci-dessous, il y a 4 paramètres :
 * paramètre `K1` avec une valeur initiale de 10000 et une distribution log-Normale (moyenne log de 9 et écart-type log de 1);
 * paramètre `P0` avec une valeur initiale de 100 et une distribution Gaussienne (moyenne de 100 et écart-type de 10);
 * paramètre `r` avec une valeur initiale de 0.001 et une distribution log-Normale (moyenne log de -7 et écart-type log de 1);
 * paramètre `K2` qui n'est pas encore renseigné (les même valeurs que `K1` seront utilisées); notez la présence d'informations sur ce qui est attendue dans les différents champs et les messages d'erreur en bas du composant indiquant ce qu'il reste à faire pour compléter la spécification des *a priori*.

![Paramètres](./help/parameters_fr.png)

<div id='dat' class="link"> </div>

# Données de calage

Ce composant permet de spécifier les données de calage du modèle. 
Sur sa partie gauche il permet d’importer un ou plusieurs jeux de données et sur sa partie droite de spécifier les données à utiliser pour chaque variable d'entrée et de sortie.

Pour importer un fichier, il est possible de faire un « drag & drop » ou bien de rechercher sur son ordinateur le(s) fichier(s) (fichier texte ; de nombreux formats sont possibles).
Plusieurs fichiers textes peuvent être chargés si nécessaire.
Pour chaque fichier, un apercu du contenu est disponible et leur suppression du projet est également possible.

Il est nécessaire de préciser pour chaque variable d’entrée et chaque variable de sortie, quelle est la colonne/variable du ou des fichiers importés qu’il convient de lui attribuer.
Notez que si les noms de colonne dans les jeux de données correspondent aux noms des variables d’entrée/sortie, ces associations sont automatiquement établies.
Pour les variables de sortie, il est également possible de spécifier des données incertaines en spécifiant des *valeurs* et des *écart-types* associés.

Dans l'exemple ci-dessous, un seul fichier (nommé « twoPop.txt », téléchargeable [ici](./help/twoPop.txt)) a été chargé.
Celui-ci a 101 lignes et 5 colonnes.
Sur la droite, les 5 colonnes ont été affectées aux différentes variables d'entrée et de sortie.

![Données de calage](./help/data_fr.png)

<div id='err' class="link"> </div>

# Modèle(s) des erreurs réstantes

Ce composant permet de modifier les modèles des erreurs réstantes (ou erreurs structurelles) associées aux variables de sorties.
Ces modèles d’erreur permettent de rendre compte des erreurs associées au modèle lui-même (erreurs qui ne peuvent pas être expliqué par les incertitudes des données de calage). 
Il s'agit d'une étape optionnelle et il est recommandé de laisser les valeurs par défaut dans la plupart des cas.

<div id='cal' class="link"> </div>

# Calibration

Ce composant permet de lancer la calibration du modèle par *BaM* suivant la spécification du modèle faite dans les composant situés au dessus.
Avant de lancer la calibration, il est recommendé de sauvegarder votre projet en cliquant sur  « Sauvegarder le projet » sur le panneau situé à gauche de l'écran.

En cliquant sur  « Executer BaM: calibration » vous pouvez lancer les calculs de *BaM*.
Ceux-ci peuvent prendre plus ou mois de temps selon la compléxité du modèle et surtout la quantité de données de calage. 
Une barre de progression permet de suivre l'avancée des calculs.

<div id='res' class="link"> </div>

# Résultat de la calibration de *BaM*

A la fin de la calibration du modèle par *BaM*, un nouveau composant, présentant les résultats et permettant de les télécharger, est ajouté. Il comporte 3 onglets : 
* **Paramètres**:
L’onglet « Paramètres » permet de visualiser les « traces » (série d’échantillons) des simulations MCMC pour chaque paramètre ou bien les densités *a posteriori* (comme dans la figure ci-dessous).
* **Fichiers résultats**:
Cet onglet liste les différents fichiers résultat qui peuvent être prévisualisés et téléchargés (soit séparement, soit tous ensemble dans une archive .zip).
* **Log de *BaM***:
Cet onglet permet de voir les sorties de la console de *BaM* (comme si *BaM* avait été exécuté en ligne de commande). Cet onglet est surtout utile en cas de plantage de *BaM* pour en identifier la cause.

![Résultat de la calibration](./help/rescal_fr.png)

<div id='mpred' class="link"> </div>

# Prédiction(s)

Quand un modèle a été calibré, il est ensuite possible de faire des "prédictions", c'est-à-dire d'utiliser le modèle calibré avec des (nouvelles) données d'entrée pour prédire les variables de sorties (associées de leurs incertitudes).

Plusieurs prédictions peuvent être créées en cliquant sur *Ajouter une nouvelle prédiction" dans le composant **Prédiction(s)**. Une prédiction doit avoir un nom unique qui vous sera demandé lors de sa création.

<div id='pred' class="link"> </div>

# Prédiction: \<nom de la prédiction\>

Le composant **Prédiction:** (suivi du nom de la prédiction) permet de calculer les sorties du modèle calibré associées à des valeurs pour les variables d'entrée que vous lui spécifiez.
Ce composant comporte deux onglets:
* **Configuration de la prédiction** où la prédiction peut être configurée;
* **Résultats de la prédiction** où les fichiers résultats sont listés et peuvent être prévisualisés et téléchargés.

La configuration d'une prédiction requiert:
* l'importation d'un (ou plusieurs) jeu(x) de données contenant les valeurs des variables d'entrées que vous souhaitez utiliser;
* l'association de chaque variable d'entrée à un fichier (importé) et une colonne;
* la spécification du type de prédiction, c'est-à-dire, si vous souhaitez avoir (1) seulement la prédiction *MaxPost* (associée aux paramètres maximisant l'a posteriori, i.e. le résultat le plus probable) sans aucune incertitude, (2) les incertitudes paramètriques seulement (incertitudes provenant des paramètres du modèle) ou bien (3) toutes les incertitudes, paramètriques comme précédemment et structurelles, provenant des modèles d'erreurs restantes associées aux variables de sortie (voir composant **[Modèle(s) des erreurs réstantes](#err)**).

Dans l'exemple présenté ci-dessous, le fichier "twoPop.txt" (le même que celui utilisé lors de la calibration) a été importé (voir à gauche). Celui-ci est utilisé pour spécifier les valeurs des variables d'entrée à utiliser lors de la prédiction (à droite). Les incertitudes paramètriques et structurelles seront prises en compte dans le calcul des variables de sorties et de leurs incertitudes associées.

![Résultat de la calibration](./help/pred_fr.png)
