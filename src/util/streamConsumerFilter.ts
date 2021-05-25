import * as jsonata from "jsonata";
import { StreamConsumerFilterOperators, StreamConsumerFilter } from "../stream";

export const callbackWithMessageFiltering = (event: any, filters: StreamConsumerFilter, callback: Function) => {
  if (!filters || !filters.expressions.length) return callback(event);

  const parsedEvent = JSON.parse(event);
  const decodedPayload = atob(parsedEvent.payload);
  let parsedPayload;
  try {
    parsedPayload = JSON.parse(decodedPayload);
  } catch (error) {
    return callback(event);
  }

  const filterString = getFilterExpressionString(filters);
  const filterExpression = jsonata(filterString);

  try {
    if (!filterExpression.evaluate(parsedPayload)) {
      parsedEvent.payload = btoa("{}");
    }
  } catch (error) {
    parsedEvent.payload = btoa("{}");
  }

  return callback(JSON.stringify(parsedEvent));
};

const getFilterExpressionString = (filters: StreamConsumerFilter) => {
  let filterString = "";

  filters.expressions.forEach((expression, index) => {
    const isLastExpression = filters.expressions.length - 1 === index;

    filterString = `${filterString} ${convertExpressionToFilter(
      expression.key,
      expression.value,
      filters.condition,
      isLastExpression
    )}`;

    switch (expression.op) {
      case StreamConsumerFilterOperators.EQUALS:
        filterString = filterString.replace("[COMPARISON_OPERATOR]", "=");
        break;
      case StreamConsumerFilterOperators.NOT_EQUALS:
        filterString = filterString.replace("[COMPARISON_OPERATOR]", "!=");
        break;
      case StreamConsumerFilterOperators.GREATER_THAN:
        filterString = filterString.replace("[COMPARISON_OPERATOR]", ">");
        break;
      case StreamConsumerFilterOperators.LESS_THAN:
        filterString = filterString.replace("[COMPARISON_OPERATOR]", "<");
        break;
      case StreamConsumerFilterOperators.GREATER_THAN_OR_EQUALS:
        filterString = filterString.replace("[COMPARISON_OPERATOR]", ">=");
        break;
      case StreamConsumerFilterOperators.LESS_THAN_OR_EQUALS:
        filterString = filterString.replace("[COMPARISON_OPERATOR]", "<=");
        break;
    }
  });

  return filterString;
};

const convertExpressionToFilter = (
  key: string,
  value: string | number,
  condition: string,
  isLastExpression: boolean
) => {
  let filter = `[KEY] [COMPARISON_OPERATOR] [VALLUE] ${!isLastExpression ? condition : ""}`;

  let _key = key;
  let _value = `${typeof value !== "number" ? `"${value}"` : value}`;

  if (_key.includes(".")) {
    const lastIndexOfDot = _key.lastIndexOf(".");
    _key = `${_key.slice(0, lastIndexOfDot)}[${_key.slice(lastIndexOfDot + 1, _key.length)}`;
  }

  filter = filter.replace("[KEY]", _key);
  filter = filter.replace("[VALLUE]", `${_key.includes(".") ? `${_value}]` : _value}`);
  return filter;
};
