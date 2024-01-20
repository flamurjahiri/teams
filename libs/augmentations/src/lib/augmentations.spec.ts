import {augmentations} from './augmentations';
import {set, unset} from "./array/augmentation.utils";

describe('augmentations', () => {
  it('should work', () => {
    expect(augmentations()).toEqual('augmentations');
  });
});

describe("Object set -> ", () => {


  //region initializations

  let emptyObject, nullObject, object1, object2;
  beforeEach(() => {
    emptyObject = {};
    nullObject = undefined;
    object1 = {
      _id: '1',
      name: 'Name',
      building: {
        _id: 'buildingId',
        name: 'buildingName'
      },
    }
    object2 = {
      _id: '1',
      name: 'Name',
      building: {
        _id: 'buildingId',
        name: 'buildingName'
      },
      test: {
        test: 'hej'
      }
    }
  })

  //endregion


  //region sets

  it("Set to empty object", () => {
    expect(JSON.stringify(set(emptyObject, 'building.name', 'test'))).toBe(JSON.stringify({building: {name: 'test'}}));
  });

  it("Replace name", () => {
    set(object1, "name", "test");
    expect(object1.name).toBe("test");
  })

  it("Replace an object", () => {
    expect(JSON.stringify(set(object1, "building", {'b': 123}))).toBe(JSON.stringify({
      _id: '1',
      name: 'Name',
      building: {b: 123}
    }))
  })

  it("Replace an object item", () => {
    expect(JSON.stringify(set(object1, "building.name", '123'))).toBe(JSON.stringify({
      _id: '1',
      name: 'Name',
      building: {
        _id: 'buildingId',
        name: '123'
      }
    }))
  });

  it("add an item to a nested object", () => {
    expect(JSON.stringify(set(object1, "building.test", '123'))).toBe(JSON.stringify({
      _id: '1',
      name: 'Name',
      building: {
        _id: 'buildingId',
        name: 'buildingName',
        test: '123'
      }
    }))
  });

  it("add an nested object to a nested object", () => {
    expect(JSON.stringify(set(object1, "building.test", {_id: '1', name: 'h'}))).toBe(JSON.stringify({
      _id: '1',
      name: 'Name',
      building: {
        _id: 'buildingId',
        name: 'buildingName',
        test: {_id: '1', name: 'h'}
      }
    }))
  });

  //endregion


  //region fails

  it("Null object to fail", () => {
    try {
      set(nullObject, 't', 't');
      expect(false).toBe(true); //fail here
    } catch (e) {
      expect(e.message).toBe("Object is null");
    }

  })

  it("Fail to replace string with object", () => {
    try {
      set(object1, "name", {test: {abc: '1'}});
      expect(true).toBe(false); //fail here
    } catch (e) {
      expect(e.message).toBe("name is type: string, you want to replace with an object!");
    }

  })

  it("Fail to replace object with string", () => {
    try {
      set(object1, "building", 1);
      expect(true).toBe(false); //fail here
    } catch (e) {
      expect(e.message).toBe("building is an object, you want to replace with type: number!");
    }

  })

  it("Fail to append object data to string data", () => {
    try {
      set(object2, "test.test.test", 123);
      expect(true).toBe(false); //fail here
    } catch (e) {
      expect(e.message).toBe("test is not an object, so you can't add proper value to that!");
    }

  })

  //endregion


});

describe("Object unset -> ", () => {


  //region initializations
  let emptyObject, nullObject, object2;
  beforeEach(() => {
    emptyObject = {};
    nullObject = undefined;
    object2 = {
      _id: '1',
      name: 'Name',
      building: {
        _id: 'buildingId',
        name: 'buildingName'
      },
      test: {
        test: {
          test: 'hej'
        }
      }
    }
  })

  //endregion


  //region unset

  it('Do nothing for empty objects', () => {
    expect(JSON.stringify(unset(emptyObject, 'building.name'))).toBe(JSON.stringify({}));
  });

  it("Remove key", () => {
    expect(JSON.stringify(unset(object2, '_id'))).toBe(JSON.stringify({
      name: 'Name',
      building: {
        _id: 'buildingId',
        name: 'buildingName'
      },
      test: {
        test: {
          test: 'hej'
        }
      }
    }))
  });

  it("Remove nested object", () => {
    expect(JSON.stringify(unset(object2, 'building'))).toBe(JSON.stringify({
      _id: '1',
      name: 'Name',
      test: {
        test: {
          test: 'hej'
        }
      }
    }))
  });

  it("Remove triple object", () => {
    expect(JSON.stringify(unset(object2, 'test'))).toBe(JSON.stringify({
      _id: '1',
      name: 'Name',
      building: {
        _id: 'buildingId',
        name: 'buildingName'
      }
    }))
  });

  it("Remove nested key", () => {
    expect(JSON.stringify(unset(object2, 'building.name'))).toBe(JSON.stringify({
      _id: '1',
      name: 'Name',
      building: {
        _id: 'buildingId'
      },
      test: {
        test: {
          test: 'hej'
        }
      }
    }))
  });

  it("Remove triple nested key", () => {
    expect(JSON.stringify(unset(object2, 'test.test.test'))).toBe(JSON.stringify({
      _id: '1',
      name: 'Name',
      building: {
        _id: 'buildingId',
        name: 'buildingName'
      },
      test: {
        test: {}
      }
    }))
  });

  //endregion

  //region fail
  it("Fail if undefined object", () => {
    try {
      unset(nullObject, 'test');
      expect(false).toBe(true); //fail
    } catch (e) {
      expect(e.message).toBe('Object is null');
    }
  });
  //endregion


});

