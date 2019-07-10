// @flow
import React, { useState } from 'react';
import {
  Modal,
  Text,
  TouchableHighlight,
  View,
} from 'react-native'; // eslint-disable-line
import _ from 'lodash';

type AlertProps = {
  status: {
    code: string,
    msg: string,
  }
};

const getVariant = (code: number) => {
  switch (code) {
  case 202:
    return 'success';
  default:
    return 'danger';
  }
};

const Alert = (props: AlertProps) => {
  const [modalVisible, setModalVisible] = useState(true);

  const status = _.get(props, 'status');
  if (_.isObject(status) && !_.isEmpty(status.msg) && !_.isEmpty(status.code)) {
    return (
    // <div>
    //   <Alert variant={getVariant(status.code)}>
    //     {status.msg}
    //   </Alert>
    // </div>
      <View style={{ marginTop: 22 }}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}
        >
          <View style={{ marginTop: 22 }}>
            <View>
              <Text>Hello World!</Text>
              <TouchableHighlight
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
              >
                <Text>Hide Modal</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>

        <TouchableHighlight
          onPress={() => {
            setModalVisible(true);
          }}
        >
          <Text>Show Modal</Text>
        </TouchableHighlight>
      </View>
    );
  }
  return null;
};


export default Alert;
