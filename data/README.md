# data/

Aquí va el contenido del libro-juego que importamos a MongoDB.

## El archivo `01hdlo.xml`

Es el texto del **Libro 1: Huida de la Oscuridad** de Project Aon:

- Descarga: https://www.projectaon.org/data/trunk/es/xml/01hdlo.xml
- Info y licencia: https://www.projectaon.org

> **Importante:** este XML NO se versiona en git (está en `.gitignore`). El
> texto e ilustraciones pertenecen a sus autores y se distribuyen bajo la
> **Project Aon License** (uso no comercial, con atribución). No lo
> redistribuimos a través del repositorio; cada quien lo descarga por su cuenta.

## Importar a Mongo

Desde `apps/api`:

```bash
pnpm import:book -- --dry-run   # solo parsea y muestra estadísticas
pnpm import:book                # importa a Mongo (requiere MONGODB_URI en apps/api/.env)
```
