# V1 : langues et corrections éditoriales

La liste `src.site_data.LANGS` conserve les six codes et leur ordre d'indexation. La seule sélection publique est `PUBLISHED_LANGUAGES` dans `src/language_config.py`, actuellement `("fr", "en", "sv")`. Pour réactiver NL, DE ou LB : modifier uniquement ce tuple, puis relancer `INSTAGRAM_SNAPSHOT_MODE=skip ./scripts/build.sh`. Le build régénère pages, formulaires, sélecteur, accueil, redirections, Edge Function, hreflang et sitemap. `en` reste le repli. Les anciennes URL publiées de langues désactivées reçoivent une 302 vers la page anglaise équivalente ; les routes inconnues répondent 404.

Corrections sur les sources des six langues :

- `src/release_content.py` : libellé et titre suédois `Samarbetspartners`.
- `src/presentation_data.py` et `work/build.py` : suppression de la phrase demandant de contacter l'équipe avant l'arrivée avec un cheval, dans les six langues.
- `src/site_data.py` : suppression de la mention d'exclusion des actes vétérinaires dans `p1_copy`, retrait du saut dans `p3_copy`, avec le passage suédois `Galopp och uteritter.`, et renommage de `p4_title` en « Training / Entraînement / Training / Training / Träning / Training ». Les mentions du saut dans les autres activités sont préservées.
- `src/site_data.py`, `src/presentation_data.py`, `src/form_data.py` : renvois à la quatrième prestation généralisés. La clé interne `programme-jumping` reste stable pour préserver les valeurs de formulaires historiques.
- `work/build.py` et `src/designs/equilibre.css` : Sowatt ajouté à la grille des partenaires avec son lien officiel, sans logo inventé. Le nom est présenté comme marque typographique, accessible et responsive.

Les fichiers sous `dist/` sont générés par `work/build.py`. La suppression des pages NL/DE/LB n'enlève pas `dist/assets/`.
