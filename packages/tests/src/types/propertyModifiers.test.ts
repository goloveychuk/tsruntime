import {getClassType, hasModifier, Reflective, Types} from "tsruntime";

class Cls {
  f!: string;
  protected g!: string;
  constructor() {
  }
}

@Reflective
abstract class SubCls extends Cls {
  a!: string;
  public b!: string;
  protected c!: string;
  private d!: string;
  readonly e!: string;
  protected readonly g!: string;
  abstract h: string;
  protected abstract i: string;
  public readonly j!: string;

  constructor() {
    super();
  }
}

function getProperty(name: string) {
  const type = getClassType(SubCls);
  return type.properties[name];
}

function matchModifiers(propName: string, expected: Types.ModifierFlags[]) {
  for (const modifierFlag of expected) {
    expect({
      name: propName,
      modifierFlag,
      hasModifier: hasModifier(getProperty(propName) as any as {modifiers: number}, modifierFlag)
    }).toEqual({
      name: propName,
      modifierFlag,
      hasModifier: true
    });
  }
}

describe("class properties modifiers", () => {
  it("matches modifiers", () => {
    matchModifiers("a", [Types.ModifierFlags.None]);
    matchModifiers("b", [Types.ModifierFlags.Public]);
    matchModifiers("c", [Types.ModifierFlags.Protected]);
    matchModifiers("d", [Types.ModifierFlags.Private]);
    matchModifiers("e", [Types.ModifierFlags.Readonly]);
    matchModifiers("g", [Types.ModifierFlags.Protected, Types.ModifierFlags.Readonly]);
    matchModifiers("h", [Types.ModifierFlags.Abstract]);
    matchModifiers("i", [Types.ModifierFlags.Protected, Types.ModifierFlags.Abstract]);
    matchModifiers("j", [Types.ModifierFlags.Public, Types.ModifierFlags.Readonly]);
  });
});
