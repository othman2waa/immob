# Médias et scène 3D

## Photographies

Photographies de démonstration téléchargées depuis Unsplash le 11 octobre 2026, sous la [licence Unsplash](https://unsplash.com/license). Elles illustrent une ambiance architecturale et ne représentent pas les projets fictifs, leur localisation ou leurs équipements. Aucun appel à Unsplash au runtime : fichiers WebP stockés dans public/images et distribués par next/image.

La licence permet les usages commerciaux et non commerciaux ; ne pas revendre les photographies sans modification ni recréer un service de photos concurrent. Remplacer les visuels par les médias autorisés de chaque projet avant une publication commerciale.

| Fichier | Source | Dimensions | SHA-256 |
| --- | --- | --- | --- |
| hero-villa.webp | [Unsplash](https://images.unsplash.com/photo-1613490493576-7fde63acd811?fm=webp&fit=crop&w=1800&q=80) | 1800 × 1200 | `99f6ab65788a0505b05c25588c9c37dbb6976e82427b0c63df96bff0433daf2c` |
| residence-atlas.webp | [Unsplash](https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fm=webp&fit=crop&w=1200&q=80) | 1200 × 800 | `2a649774fe625ea837c3533eb1d32cb52836213103a5cb249c189295af9b35f3` |
| villas-des-palmiers.webp | [Unsplash](https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?fm=webp&fit=crop&w=1200&q=80) | 1200 × 1006 | `672bdd099bd56f077079b7cb40dae069a2f979fb8bab9c4eb59b34bccb9153fd` |
| les-jardins-agdal.webp | [Unsplash](https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?fm=webp&fit=crop&w=1200&q=80) | 1200 × 800 | `d4acf95df77a0ccf79e7f79c428f8e59813db0efe5c09b07d96344d83bbef464` |
| anfa-horizon.webp | [Unsplash](https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?fm=webp&fit=crop&w=1200&q=80) | 1200 × 816 | `76d21d9f1e73ff98116433941ccaea1a20cbb035aabe100f8dcc73d69ccf768e` |
| casa-commerces.webp | [Unsplash](https://images.unsplash.com/photo-1497366216548-37526070297c?fm=webp&fit=crop&w=1200&q=80) | 1200 × 801 | `9e31703e9d81beba1fcd3fbc1c6b0f90fd711605578e5dbdd2b121d59fa2decf` |
| rabat-parc.webp | [Unsplash](https://images.unsplash.com/photo-1500382017468-9049fed747ef?fm=webp&fit=crop&w=1200&q=80) | 1200 × 675 | `7243ad2fc5a8f43697b951d4275b83d5f522b80c15cb547f90f1281de62f010a` |
| interior-detail.webp | [Unsplash](https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?fm=webp&fit=crop&w=1000&q=80) | 1000 × 750 | `60a380ba996c8d41d902f52a15e9314ccf4e2a9437a3393e02f43c68a3ad6df3` |

## Typographies

Manrope, Cormorant Garamond et Noto Sans Arabic proviennent des paquets Fontsource épinglés. Les licences SIL Open Font License sont conservées dans public/licenses. Les fichiers WOFF2 sont auto-hébergés avec next/font/local ; aucun chargement Google Fonts dans le navigateur.

## Maquette WebGL

Maquette procédurale originale construite avec Three.js : volumes de villa, pergola, piscine, oliviers et sol. Aucune texture, aucun modèle glTF externe. Elle sert uniquement à l’exploration visuelle ; aucune mesure, aucun plan ni équipement d’un projet réel ne peut être déduit de cette maquette.

Chargement différé près du viewport, pixel ratio limité à 1,5 et rotation plafonnée à 30 images/seconde. Le rendu continu s’arrête hors écran, dans un onglet masqué ou après une pause ; les ressources GPU sont libérées au démontage. La préférence de mouvement réduit supprime la rotation automatique et les animations CSS. Le défilement vertical tactile reste disponible ; rotation et zoom sont également accessibles par des boutons clavier. Repli photographique si WebGL est absent et contenu lisible sans JavaScript.

Dans les tests uniquement, PLAYWRIGHT_USE_SOFTWARE_GL=1 active SwiftShader pour rendre WebGL sans GPU physique. Les visiteurs utilisent le renderer de leur navigateur.
