import * as _ from 'lodash';

function convert(data) {
  if (Array.isArray(data)) {
      return _.map(data, (elem) => convert(elem));
  }
  data = data.toObject({ getters: true, versionKey: false });
  if (data._id) {
      data.id = data._id.toString();
      delete data._id;
  }
  return data;
}

export default convert;