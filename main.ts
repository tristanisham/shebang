// @deno-types="https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.d.ts'"
import Fuse from "fuse.js";
import * as colors from "std/fmt/colors.ts";
type MethodList = { key: string; altKey?: string; func: () => string }[];

class Methods {
  private index: Fuse<unknown>;
  constructor() {
    const methodList: MethodList = [
      {
        key: "bash",
        altKey: "sh",
        func: () => {
          return "#!/usr/bin/env bash";
        },
      },
      {
        key: "node",
        altKey: "npm",
        func: () => {
          return "#!/usr/bin/env node";
        },
      },
    ];
    this.index = new Fuse(methodList, { keys: ["key", "altKey"], includeScore: true });
  }

  public findShebang(query: string): (() => string) | undefined {
    const searchResults = this.index.search(query)[0]; // Access the first result directly using [0]
    if (searchResults === undefined || searchResults.item === undefined) {
      return undefined;
    }

    if (searchResults.score !== undefined && searchResults.score > 0.5) {
      return undefined;
    }
    
    return (searchResults.item as MethodList[0]).func; // Return the func property from the item
  }

  public helpMessage(): void {
    console.log(
      `${colors.green("shebang")} prints application shebangs to ${colors.white("stdout")
      }`,
    );
    const data = this.index.getIndex().toJSON();
    console.log(`${colors.white("commands:")}`);
    for (const key of data.keys) {
      console.log(key);
    }
  }
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  if (Deno.args.length > 0) {
    const methods = new Methods();
    if (Deno.args.includes("-h") || Deno.args.includes("--help")) {
      methods.helpMessage();
      Deno.exit(0);
    }

    const shebang = methods.findShebang(Deno.args[0]);
    if (shebang === undefined) {
      console.error(`The shebang for ${Deno.args[0]} wasn't found.`);
      Deno.exit(0);
    }

    console.log(shebang());
    // Deno.stdout.writeSync(new TextEncoder().encode(shebang()))
  } else {
    const methods = new Methods();
    methods.helpMessage();
    Deno.exit(0)
  }
}
