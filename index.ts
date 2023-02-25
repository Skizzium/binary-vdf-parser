type Property = { key: string, value: string | number | Property[] };

function getString(buffer: Buffer, offset: number): [ value: string, length: number ] {
  const currentBuffer = buffer.subarray(offset);
  const length = currentBuffer.findIndex((byte) => byte === 0x00);
  return [ currentBuffer.toString('utf-8', 0, length), length ];
}

function getNumber(buffer: Buffer, offset: number): number {
  return buffer.readUInt32LE(offset);
}

function getProperty(buffer: Buffer, offset: number): { offset: number, property: Property } {
  switch (buffer[offset]) {
    // Property containing object (of more properties)
    case 0x00: {
      offset++; // Skip newmap byte

      // Read key name
      const [ key, keyLength ] = getString(buffer, offset);
      offset += keyLength + 1; // String length + null terminator

      // Get properties in value
      const property: any = { key, value: {} };
      while (buffer[offset] !== 0x08) {
        const propertyInfo = getProperty(buffer, offset);
        property.value[propertyInfo.property.key] = propertyInfo.property.value;
        offset = propertyInfo.offset;
      }
      
      offset++;
      return { offset, property };
    }

    // Property containing string
    case 0x01: {
      offset++;
      const [ key, keyLength ] = getString(buffer, offset);
      offset += keyLength + 1;

      const [ value, valueLength ] = getString(buffer, offset);
      offset += valueLength + 1;

      const property = { key, value };
      return { offset, property };
    }

    // Property containing number
    case 0x02: {
      offset++;
      const [ key, keyLength ] = getString(buffer, offset);
      offset += keyLength + 1;
      
      const value = getNumber(buffer, offset);
      offset += 4;
      
      const property = { key, value };
      return { offset, property};
    }

    default: throw new Error(`Type not implemented (0x${buffer[offset].toString(16).padStart(2, '0')} at offset ${offset} (0x${offset.toString(16).padStart(2, '0')}))`);
  }
}

function readVdf(buffer: Buffer) {
  const infos: any[] = [];
  let offset = 0;
  
  const APPINFO_STRING = '00617070696E666F00';

  while (offset < buffer.length) {
    // Find next appinfo header
    const nextAppinfoOffset = buffer.subarray(offset).indexOf(APPINFO_STRING, 0, 'hex');
    if (nextAppinfoOffset === -1) break;
    offset += nextAppinfoOffset;
    
    const appInfo: any = {};
    const propertyInfo = getProperty(buffer, offset);
    offset = propertyInfo.offset;
    appInfo[propertyInfo.property.key] = propertyInfo.property.value;
    
    infos.push(appInfo);
  }

  return infos;
}

export { readVdf };