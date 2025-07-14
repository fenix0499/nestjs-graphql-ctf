import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import { exec } from 'node:child_process';
import { promisify } from 'node:util'; 

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly platform = os.platform();
  private readonly execAsync = promisify(exec);

  async fileRead(fileName: string) {
    try {
      const result = await fs.readFile(`/${fileName}`, 'utf-8');

      return {
        output: result,
      }
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async commandExecution(cmd: string) {
    try {
      const { stdout, stderr } = await this.execAsync(cmd);

      if (stderr) throw new Error('Error in command');
      
      return {
        output: stdout,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
