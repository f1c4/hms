import { format } from "date-fns";

export function getInitials(name: string): string {
  const nameParts = name.trim().split(" ");

  if (nameParts.length < 2) {
    throw new Error("Name must include both first name and surname");
  }

  const firstNameInitial = nameParts[0].charAt(0).toUpperCase();
  const surnameInitial = nameParts[1].charAt(0).toUpperCase();

  return `${firstNameInitial}${surnameInitial}`;
}

export function formatDateTime(date: Date | string | number): string {
  if (!date) {
    return "";
  }
  return format(new Date(date), "MMM. dd. yyyy HH:mm");
}

export function formatFullName(firstName: string, lastName: string): string {
  const formatName = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  return `${formatName(firstName)} ${formatName(lastName)}`;
}

/**
 * Converts a camelCase string to snake_case.
 * @param str The camelCase string to convert.
 * @returns The snake_case version of the string.
 * @example camelToSnake('firstName') // returns 'first_name'
 */
export function camelToSnake(str: string) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Recursively converts all keys of an object or objects within an array from camelCase to snake_case.
 * This function is type-safe and avoids the use of 'any'.
 * @param data The data to process (object or array).
 * @returns A new object or array with snake_case keys.
 * @example camelToSnake({ firstName: 'John' }) // returns { first_name: 'John' }
 */
export function camelToSnakeObj<T>(data: T): T {
  if (data === null || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(camelToSnakeObj) as T;
  }

  const newObj = {} as { [key: string]: unknown };
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`,
      );
      const value = data[key as keyof T];
      // Recursively call camelToSnakeObj for nested objects
      newObj[snakeKey] = camelToSnakeObj(value);
    }
  }
  return newObj as T;
}

/**
 * Recursively converts all keys of an object or objects within an array from snake_case to camelCase.
 * This function is type-safe and avoids the use of 'any'.
 * @param data The data to process (object or array).
 * @returns A new object or array with camelCase keys.
 */
export function snakeToCamel<T>(data: T): T {
  if (data instanceof Date) {
    return data;
  }

  if (data === null || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(snakeToCamel) as T;
  }

  const newObj = {} as { [key: string]: unknown };
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      const value = data[key as keyof T];
      // Recursively call snakeToCamel for nested objects
      newObj[camelKey] = snakeToCamel(value);
    }
  }
  return newObj as T;
}

/** * Converts a snake_case string to camelCase.
 * @param s The snake_case string to convert.
 * @returns The camelCase version of the string.
 * @example toCamel('first_name') // returns 'firstName'
 */
const toCamel = (s: string): string => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace("-", "")
      .replace("_", "");
  });
};

/**
 * A type guard to check if a value is a plain object.
 * @param obj The value to check.
 */
const isObject = (obj: unknown): obj is Record<string, unknown> => {
  return obj === Object(obj) && !Array.isArray(obj) &&
    typeof obj !== "function";
};

/**
 * Recursively converts all keys in an object or array from snake_case to camelCase.
 * @param obj The input data, which is of an unknown type.
 * @returns The transformed data, also of an unknown type.
 */
export function deepSnakeToCamel(obj: unknown): unknown {
  if (isObject(obj)) {
    const n: Record<string, unknown> = {};

    Object.keys(obj).forEach((k) => {
      // obj[k] is of type 'unknown', so we pass it to the recursive function.
      n[toCamel(k)] = deepSnakeToCamel(obj[k]);
    });

    return n;
  } else if (Array.isArray(obj)) {
    // If it's an array, map over its elements and apply the transformation recursively.
    return obj.map((i) => {
      return deepSnakeToCamel(i);
    });
  }

  // If it's not an object or array, return the value as is.
  return obj;
}
