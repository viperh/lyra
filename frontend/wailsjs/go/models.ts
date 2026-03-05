export namespace fileexplorer {
	
	export class FileEntry {
	    name: string;
	    path: string;
	    isDir: boolean;
	    size: number;
	    modTime: string;
	    mode: string;
	
	    static createFrom(source: any = {}) {
	        return new FileEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	        this.isDir = source["isDir"];
	        this.size = source["size"];
	        this.modTime = source["modTime"];
	        this.mode = source["mode"];
	    }
	}

}

export namespace network {
	
	export class ConnectionInfo {
	    localAddr: string;
	    localPort: number;
	    remoteAddr: string;
	    remotePort: number;
	    status: string;
	    pid: number;
	    process: string;
	    lat: number;
	    lng: number;
	    country: string;
	    city: string;
	
	    static createFrom(source: any = {}) {
	        return new ConnectionInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.localAddr = source["localAddr"];
	        this.localPort = source["localPort"];
	        this.remoteAddr = source["remoteAddr"];
	        this.remotePort = source["remotePort"];
	        this.status = source["status"];
	        this.pid = source["pid"];
	        this.process = source["process"];
	        this.lat = source["lat"];
	        this.lng = source["lng"];
	        this.country = source["country"];
	        this.city = source["city"];
	    }
	}

}

export namespace sysmon {
	
	export class DiskInfo {
	    mountpoint: string;
	    total: number;
	    used: number;
	    usedPercent: number;
	    fstype: string;
	
	    static createFrom(source: any = {}) {
	        return new DiskInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.mountpoint = source["mountpoint"];
	        this.total = source["total"];
	        this.used = source["used"];
	        this.usedPercent = source["usedPercent"];
	        this.fstype = source["fstype"];
	    }
	}
	export class SystemStats {
	    cpuPercent: number[];
	    cpuOverall: number;
	    memTotal: number;
	    memUsed: number;
	    memPercent: number;
	    disks: DiskInfo[];
	    hostname: string;
	    os: string;
	    uptime: number;
	
	    static createFrom(source: any = {}) {
	        return new SystemStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.cpuPercent = source["cpuPercent"];
	        this.cpuOverall = source["cpuOverall"];
	        this.memTotal = source["memTotal"];
	        this.memUsed = source["memUsed"];
	        this.memPercent = source["memPercent"];
	        this.disks = this.convertValues(source["disks"], DiskInfo);
	        this.hostname = source["hostname"];
	        this.os = source["os"];
	        this.uptime = source["uptime"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

