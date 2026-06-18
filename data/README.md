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

### Bases de datos separadas (dev / prod)

- **Desarrollo local** (`lonewolf-dev`): el `MONGODB_URI` de `apps/api/.env` apunta aquí.
- **Producción** (`lonewolf-prod`): la variable `MONGODB_URI` en Vercel apunta aquí.

Para importar a producción, cambia temporalmente el `MONGODB_URI` de `apps/api/.env`
para apuntar a `lonewolf-prod`, ejecuta `pnpm import:book` y luego restaura el valor.
Ver instrucciones detalladas en [DEPLOY_PLAN.md — M2](../DEPLOY_PLAN.md).

El XML de Project Aon para el Libro 1 cambia raramente; esta operación es puntual.
