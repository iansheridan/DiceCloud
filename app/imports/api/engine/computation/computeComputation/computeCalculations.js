import resolve, { toString } from '/imports/parser/resolve.js';
import INLINE_CALCULATION_REGEX from '/imports/constants/INLINE_CALCULTION_REGEX.js';

export default function computeCalculations(computation, node){
  if (!node.data) return;
  // evaluate all the calculations
  node.data._computationDetails?.calculations?.forEach(calcObj => {
    evaluateCalculation(calcObj, computation.scope)
  });
  node.data._computationDetails?.inlineCalculations?.forEach(inlineCalcObj => {
    embedInlineCalculations(inlineCalcObj);
  });
}

function evaluateCalculation(calculation, scope){
  const parseNode = calculation.parseNode;
  const fn = calculation._parseLevel;
  const calculationScope = {...calculation._localScope, ...scope};
  const {result: resultNode, context} = resolve(fn, parseNode, calculationScope);
  calculation.errors = context.errors;
  if (resultNode?.parseType === 'constant'){
    calculation.value = resultNode.value;
  } else if (resultNode?.parseType === 'error'){
    calculation.value = null;
  } else {
    calculation.value = toString(resultNode);
  }
  // remove the working fields
  delete calculation._parseLevel;
  delete calculation._localScope;
}

function embedInlineCalculations(inlineCalcObj){
  const string = inlineCalcObj.text;
  const calculations = inlineCalcObj.inlineCalculations;
  if (!string || !calculations) return;
  let index = 0;
  inlineCalcObj.value = string.replace(INLINE_CALCULATION_REGEX, substring => {
    let calc = calculations[index++];
    return (calc && 'value' in calc) ? calc.value : substring;
  });
}
