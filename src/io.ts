import { Optional } from './optional';

export namespace io {
    export enum ErrorKind {
        AddrInUse = 'address in use',
        AddrNotAvailable = 'address not available',
        AlreadyExists = 'entity already exists',
        ArgumentListTooLong = 'argument list too long',
        BrokenPipe = 'broken pipe',
        ConnectionAborted = 'connection aborted',
        ConnectionRefused = 'connection refused',
        ConnectionReset = 'connection reset',
        CrossesDevices = 'cross-device link or rename',
        Deadlock = 'deadlock',
        DirectoryNotEmpty = 'directory not empty',
        ExecutableFileBusy = 'executable file busy',
        FileTooLarge = 'file too large',
        FilesystemLoop = 'filesystem loop or indirection limit (e.g. symlink loop)',
        FilesystemQuotaExceeded = 'filesystem quota exceeded',
        HostUnreachable = 'host unreachable',
        Interrupted = 'operation interrupted',
        InvalidData = 'invalid data',
        InvalidFilename = 'invalid filename',
        InvalidInput = 'invalid input parameter',
        IsADirectory = 'is a directory',
        NetworkDown = 'network down',
        NetworkUnreachable = 'network unreachable',
        NotADirectory = 'not a directory',
        NotConnected = 'not connected',
        NotFound = 'entity not found',
        NotSeekable = 'seek on unseekable file',
        Other = 'other error',
        OutOfMemory = 'out of memory',
        PermissionDenied = 'permission denied',
        ReadOnlyFilesystem = 'read-only filesystem or storage medium',
        ResourceBusy = 'resource busy',
        StaleNetworkFileHandle = 'stale network file handle',
        StorageFull = 'no storage space',
        TimedOut = 'timed out',
        TooManyLinks = 'too many links',
        Uncategorized = 'uncategorized error',
        UnexpectedEof = 'unexpected end of file',
        Unsupported = 'unsupported',
        WouldBlock = 'operation would block',
        WriteZero = 'write zero',
    }

    export class Error extends globalThis.Error implements io.Error {
        constructor(private _kind: ErrorKind, message: string) {
            super(message);
        }

        kind(): ErrorKind {
            return this._kind;
        }

        static new(kind: ErrorKind, message: string): Error {
            return new Error(kind, message);
        }

        /** @deprecated since 1.42.0: use toString() */
        description(): string {
            return this.toString();
        }

        /** @deprecated since 1.33.0: replaced by Error::source, which can support downcasting */
        cause(): Optional<globalThis.Error> {
            return new Optional(new globalThis.Error('Not implemented'));
        }

        /** The lower-level source of this error, if any. */
        source(): Optional<globalThis.Error> {
            return new Optional(new globalThis.Error('Not implemented'));
        }

        /**
         * Provides type based access to context intended for error reports.
         */
        provide(_demand: any): void {
            throw new globalThis.Error('Not implemented');
        }

        /**
         * Returns a string describing the error.
         */
        toString(): string {
            return `${this.kind()}: ${this.message}`;
        }
    }
}
