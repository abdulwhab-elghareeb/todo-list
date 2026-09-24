export function toCamelCase(kebabCaseStr, wordStartIdx){
    return kebabCaseStr.split("-").at(wordStartIdx) + kebabCaseStr.split("-").slice(wordStartIdx + 1).map((word) => word.at(0).toUpperCase() + word.slice(1).toLowerCase()).join("")
}
