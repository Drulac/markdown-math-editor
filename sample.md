# zmarkdown

this sample is a copy of [zmarkdown sample](https://zestedesavoir.github.io/zmarkdown/) because this editor use [zmarkdown](https://github.com/zestedesavoir/zmarkdown/) as md2html converter







Ceci est mon premier paragraphe.

Ceci est mon second paragraphe.

Ceci est mon premier paragraphe.
Ici, je reviens à la ligne, mais cette phrase sera toujours dans le premier paragraphe.

Ceci est mon second paragraphe.

# Titre de niveau 1

## Titre de niveau 2

### Titre de niveau 3

#### Titre de niveau 4

Le mot *italique* est en italique.

Le mot _italique_ est en italique.

Le mot **gras** est en gras.

Le mot __gras__ est en gras.


Le mot ~~barré~~ est barré.

-> Ce texte est centré. <-

-> Ce texte est aligné à droite. ->

$2^10$ vaut $1024$.

La molécule de l'eau est $H_2O$.


- Ma très belle ;
- liste ;
- à puces.

1. Mon premier.
2. Mon second.
3. Mon troisième.

- Ma très belle ;
- liste ;
    - avec une sous-liste ;
- à puces.

Pour faire un [lien](http://www.zestedesavoir.com "Zeste de Savoir") sur un morceau de texte

Pour nous contacter, cliquez [ici](mailto:contact@monsite.com).

# Maths

La syntaxe des maths est grosso modo de l'[AsciiMath](https://asciimath.org/) je vous invite à utiliser ça comme doc pour les maths, c'est assez facile à comprendre

Les maths s'écrivent entourés de signes dollars `$` :
- un seul dollar `$a+b^2$` : $a+b^2$
- deux dollar `$$a+b^2$$` : $$a+b^2$$

$$sum_3^A$$

$$sum_(i=1)^n i^3=((n(n+1))/2)^2$$

il y a quelques ajouts à la syntaxe de base, notamment `over` : `{A} over {B}` va donner $${A} over {B}$$

$$L = {1} over {2} * rho v^2 S C_L$$

# syntaxes des tableaux

## Syntaxe simple

pas besoin de tout aligner parfaitement, **fait gagner beaucoup de temps**
not need to align everything perfectly, **save a lot of time**

-------------------
Nom    |   Age
===============
Fred    |    39
-------------------
Sam    |   38
-------------------
Alice     |   35
-------------------
Mathilde  | 35
-------------------

possibilité de créer des **cellules multi-lines**

-------------------
Nom    |   Age
===============
Fred    |    39
-------------------
Sam    |   38
-------------------
Alice     |   35
Mathilde  | 
-------------------

possibilité de créer des **cellules multi-colonnes**

le caractère `#` augmente la largeur de la cellule d'une colonne
_La dernière cellule d'une ligne prends la place restante s'il y en a, comme le font les cellules des 2 dernières lignes_

----------------------------
Nom    |   Age | play music
===========================
Melan         #| true
----------------------------
Sam    |   38  | No
----------------------------
Alice     |   35
Mathilde  | 
----------------------------
Fred    |    39
----------------------------



## Une autre syntaxe simple

Moins puissante

_pas besoin de tout aligner parfaitement_

Nom     |   Age
------|-----
Fred |   39
Sam |   38
Alice  |   35
Mathilde  | 35
Table: Tableau des âges


## Syntaxe complexe

La syntaxe complexe permet de faire des choses folles comme le mot `spans` qui est sur deux lignes, mais nécessite que tout soit parfaitement alignés, **ce qui prends beaucoup de temps à écrire et à éditer**

The complexe syntaxe allow crazy things like the `spans` words wich is on 2 rows, but require everythings to be well aligned, so **take a lot of time to write and edit**

+-------+----------+------+
| Table Headings   | Here |
+-------+----------+------+
| Sub   | Headings | Too  |
+=======+==========+======+
| cell  | column spanning |
+ spans +----------+------+
| rows  | normal   | cell |
+-------+----------+------+
| multi | cells can be    |
| line  | *formatted*     |
|       | **paragraphs**  |
| cells |                 |
| too   |                 |
+-------+-----------------+


# Math

$$a * x^2 + b * x + c = 0  => x = {-b +- sqrt{b^2 - 4ac}} over {2a}$$

Si vous voulez écrire votre formule au sein même d'un paragraphe (comme ceci : $a \cdot x^2 + b \cdot x + c = 0$), alors n'utilisez cette fois qu'un seul caractère dollar `$` avant et après votre formule.


# Code

Sans langage : 
```
#!/usr/bin/env python3

print("Hello, World!")
```


Avec un langage :

```python
#!/usr/bin/env python3

print("Hello, World!")
```

Surligner des lignes :

```perl hl_lines="1 4-6"
use strict;
use warnings;

print "Comment vous appelez-vous ? ";
my $nom = <>; # Récupération du nom de l'utilisateur
chomp $nom;   # Retrait du saut de ligne
print "Bonjour, $nom !\n";
```

![Logo Creative Commons](http://mirrors.creativecommons.org/presskit/logos/cc.logo.png)

!(http://www.youtube.com/watch?v=oavMtUWDBTM)

Utilisez ||Ctrl|| + ||Shift|| + ||C|| pour copier.
Utilisez ||Ctrl|| + ||Shift|| + ||V|| pour coller.

# Smileys

:)

:p :euh:

# Balises spéciales

[[information]]
| Ceci est une balise d'information.
|
| Cool, non ?

> Ceci est une citation
> sur plusieurs lignes
Source: Citez vos sources !


[[neutre | Théorème de Pythagore]]
| Un triangle ABC est rectangle en a si et seulement si $AB^2 + AC^2 = BC^2$


[[secret]]
| Ceci est un secret
|
| Cool, non ?

$pi$


Bienvenue sur ZdS !

*[ZdS]: Zeste de Savoir


Markdown[^mdown] est une syntaxe légère d'écriture de documents. Pandoc[^pandoc] est un convertisseur de documents.

[^mdown]: Plus d'informations sur [Markdown](http://daringfireball.net/projects/markdown/).

[^pandoc]: Plus d'informations sur [Pandoc](http://johnmacfarlane.net/pandoc/).


































Utilisez ||Ctrl|| + ||C|| pour coller, en étant en dehors du mode insertion
