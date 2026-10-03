import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const rootDir = process.cwd();
const outputZip = path.resolve(rootDir, '..', 'phoneme-activity-builder-assessment3.zip');

console.log('--- Creating Clean Assessment 3 Submission Archive ---');
console.log(`Source: ${rootDir}`);
console.log(`Destination: ${outputZip}`);

// Python one-liner to create a clean zip excluding node_modules, .next, and temp artifacts
const pythonScript = `
import zipfile, os

source_dir = r"${rootDir}"
output_zip = r"${outputZip}"

exclude_dirs = {'node_modules', '.next', 'test-results', 'playwright-report'}

print(f"Archiving {source_dir} to {output_zip}...")
file_count = 0
with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(source_dir):
        # prune excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, os.path.dirname(source_dir))
            zipf.write(full_path, rel_path)
            file_count += 1

size_mb = os.path.getsize(output_zip) / (1024 * 1024)
print(f"Archive created successfully: {file_count} files, {size_mb:.2f} MB")
`;

try {
  execFileSync('python', ['-c', pythonScript], { stdio: 'inherit' });
  console.log(`✅ Success! Archive generated at: ${outputZip}`);
} catch (err) {
  console.error('Error creating archive:', err);
  process.exit(1);
}
