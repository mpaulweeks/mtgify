
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const GROUP_CARD_TYPE_PRIORITY = ["Sorcery", "Instant", "Planeswalker", "Enchantment", "Artifact", "Creature", "Land"];
const GROUP_CARD_TYPE_DISPLAY_PRIORITY = ["Commander", "Companion", "Creature", "Planeswalker", "Artifact", "Enchantment", "Instant", "Sorcery", "Land", "Sideboard", "Uncategorized"];

exports.EnumGroupCardType = void 0;

(function (EnumGroupCardType) {
  EnumGroupCardType["Sorcery"] = "Sorcery";
  EnumGroupCardType["Instant"] = "Instant";
  EnumGroupCardType["Planeswalker"] = "Planeswalker";
  EnumGroupCardType["Enchantment"] = "Enchantment";
  EnumGroupCardType["Artifact"] = "Artifact";
  EnumGroupCardType["Creature"] = "Creature";
  EnumGroupCardType["Land"] = "Land";
  EnumGroupCardType["Commander"] = "Commander";
  EnumGroupCardType["Uncategorized"] = "Uncategorized";
  EnumGroupCardType["Sideboard"] = "Sideboard";
  EnumGroupCardType["Companion"] = "Companion";
})(exports.EnumGroupCardType || (exports.EnumGroupCardType = {}));

var EnumRarity;

(function (EnumRarity) {
  EnumRarity["Common"] = "common";
  EnumRarity["Uncommon"] = "uncommon";
  EnumRarity["Rare"] = "rare";
  EnumRarity["Mythic"] = "mythic";
})(EnumRarity || (EnumRarity = {}));

function dfGroupArrayFieldByPriority(priority, defaultValue) {
  return arrayValue => {
    let returnValue = defaultValue;
    arrayValue = [arrayValue].flat();
    priority.find(type => {
      if (arrayValue.includes(type)) {
        returnValue = type;
        return true;
      }
    });
    return returnValue;
  };
}
function dfGroupFieldByPriority(priority, defaultValue) {
  return inputValue => {
    let returnValue = defaultValue;
    priority.find(type => {
      if (inputValue === type) {
        returnValue = type;
        return true;
      }
    });
    return returnValue;
  };
}

const groupKeyByCardTypePriority = /*#__PURE__*/dfGroupArrayFieldByPriority(GROUP_CARD_TYPE_PRIORITY);

exports.GROUP_CARD_TYPE_DISPLAY_PRIORITY = GROUP_CARD_TYPE_DISPLAY_PRIORITY;
exports.GROUP_CARD_TYPE_PRIORITY = GROUP_CARD_TYPE_PRIORITY;
exports.dfGroupArrayFieldByPriority = dfGroupArrayFieldByPriority;
exports.dfGroupFieldByPriority = dfGroupFieldByPriority;
exports.groupKeyByCardTypePriority = groupKeyByCardTypePriority;

function array_unique(array){
  return array.filter(function(el, index, arr) {
      return index == arr.indexOf(el);
  });
}

function getCardMainTypes(types) {
  let mainTypes = types.reduce((a, b) => {
    a.push(...b[0]);
    return a;
  }, []);
  return array_unique(mainTypes);
}

function parseScryfallCardTypeExtra(type_line_en) {
  return type_line_en.split(/\s*\/\/\s*/).map(parseScryfallCardType);
}

function parseScryfallCardType(type_line_en) {
  let ls = type_line_en.trim().split(/—/).filter(v => v.length);

  if (!ls.length || ls.length > 2) {
    throw new SyntaxError(`Invalid card type: ${type_line_en}`);
  }

  return ls.map(t => t.trim().split(/\s+/).filter(v => v.length));
}

exports.getCardMainTypes = getCardMainTypes
exports.parseScryfallCardTypeExtra = parseScryfallCardTypeExtra
exports.parseScryfallCardType = parseScryfallCardType
