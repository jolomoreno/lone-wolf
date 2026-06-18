import type { KaiDiscipline } from "./kai-discipline";

/** Descripción de cada disciplina del Kai, extraída del XML de Project Aon (sección de disciplinas). */
export const KAI_DISCIPLINE_DESCRIPTIONS: Record<KaiDiscipline, string> = {
  camouflage:
    "Esta disciplina posibilita a un Señor del Kai confundirse con el medio que le rodea. En el campo puede ocultarse entre los árboles sin ser descubierto y pasar cerca de un enemigo sin ser visto. En una aldea o ciudad le permite parecer y hablar como un nativo de esa región y puede ayudarle a encontrar refugio o un lugar seguro donde esconderse.",

  hunting:
    "Esta disciplina garantiza a un Señor del Kai que nunca morirá de hambre en el bosque. Siempre será capaz de cazar para obtener alimento, excepto en tierras yermas o desiertas. Esta habilidad también capacita a un Señor del Kai para moverse con precaución cuando persigue a su presa. Si eliges esta disciplina, no tendrás necesidad de buscar comida cuando se ordena comer.",

  sixthSense:
    "Esta disciplina avisa a un Señor del Kai del inminente peligro. También le revela el verdadero propósito de un extranjero o de un objeto extraño encontrado en su aventura.",

  tracking:
    "Gracias a esta disciplina, un Señor del Kai toma el sendero más conveniente en el bosque, localiza a una persona u objeto en una aldea o ciudad y descifra huellas y rastros.",

  healing:
    "Esta disciplina puede utilizarse para reponer los puntos de Resistencia perdidos en combate. Si posees esta destreza, puedes recuperar un punto de Resistencia cada vez que pases por una sección del libro sin entrar en combate. Pero sólo puede ser usada si tus puntos de Resistencia han disminuido con respecto al número inicial. Recuerda que nunca pueden sobrepasarlo.",

  weaponskill:
    "En el monasterio del Kai, cada iniciado aprende a dominar un tipo de arma. Al elegir esta disciplina, se determina al azar el arma que dominas. Cada vez que luches llevando ese arma, sumarás 2 puntos a tu Destreza en el Combate. El hecho de que domines un arma no quiere decir que inicies la aventura llevando ese arma concreta, pero tendrás oportunidad de adquirirla a lo largo de tu aventura.",

  mindshield:
    "Los Señores de la Oscuridad y muchas de las malvadas criaturas a sus órdenes tienen la habilidad de atacarte usando la fuerza de su mente. La disciplina del Kai de Defensa Psíquica te libra de perder puntos de Resistencia cuando sufras este tipo de ataques.",

  mindblast:
    "Esta disciplina permite a un Señor del Kai atacar al enemigo con la fuerza de su mente. Puede usarse al mismo tiempo que las armas normales y suma 2 puntos a tu Destreza en el Combate. No todas las criaturas con las que te encontrarás en tu aventura pueden ser dañadas por el Ataque Psíquico; cuando una criatura es inmune a este tipo de ataque, se te hace saber.",

  animalKinship:
    "Esta disciplina capacita a un Señor del Kai para comunicarse con algunos animales y para adivinar las intenciones de otros.",

  mindOverMatter:
    "Cuando un Señor del Kai domina esta disciplina puede mover pequeños objetos con los poderes de concentración de su mente.",
};
