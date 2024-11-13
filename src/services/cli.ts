// Simple function to get CLI args without external lib (e.g. commander)
export const getCliArgs = (count: number, error: string) => {
  // Take arguments from CLI
  const args = process.argv.slice(2);

  // Display error if CLI argument is not provided
  if (args.length !== count) {
    console.error(error);
    process.exit(1);
  }

  return args;
};
