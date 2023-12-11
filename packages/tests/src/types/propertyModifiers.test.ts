import {getClassType, Reflective, Types} from "tsruntime";

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
  override f!: string;
  protected override readonly g!: string;
  abstract h: string;
  protected abstract i: string;
  public readonly j!: string;

  constructor() {
    super();
  }
}

function getPropModifier(name: string) {
  const type = getClassType(SubCls);
  return type.properties[name].modifiers;
}

function matchModifiers(propName: string, expected: Types.ModifierFlags[]) {
  expect({
    name: propName,
    modifiers: getPropModifier(propName)
  }).toEqual({
    name: propName,
    modifiers: expected
  });
}

describe("class properties modifiers", () => {
  it("matches modifiers", () => {
    matchModifiers("a", [Types.ModifierFlags.None]);
    matchModifiers("b", [Types.ModifierFlags.Public]);
    matchModifiers("c", [Types.ModifierFlags.Protected]);
    matchModifiers("d", [Types.ModifierFlags.Private]);
    matchModifiers("e", [Types.ModifierFlags.None, Types.ModifierFlags.Readonly]);
    matchModifiers("f", [Types.ModifierFlags.None, Types.ModifierFlags.Override]);
    matchModifiers("g", [Types.ModifierFlags.Protected, Types.ModifierFlags.Readonly, Types.ModifierFlags.Override]);
    matchModifiers("h", [Types.ModifierFlags.None, Types.ModifierFlags.Abstract]);
    matchModifiers("i", [Types.ModifierFlags.Protected, Types.ModifierFlags.Abstract]);
    matchModifiers("j", [Types.ModifierFlags.Public, Types.ModifierFlags.Readonly]);
  });
});
