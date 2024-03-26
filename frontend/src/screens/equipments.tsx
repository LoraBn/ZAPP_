import {FlatList, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../utils/colors';
import {StackScreenProps} from '@react-navigation/stack';
import {HomeStackNavigatorParams} from '../navigation/home-stack-navigation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ScreenHeader from '../components/ui/screen-header';
import ElevatedCard from '../components/ui/elevated-card';
import ListSeperator from '../components/ui/list-seperator';
import EquipmentEditableItem from '../components/ui/equipment-editable-item';
import AddEquipmentItem from '../components/ui/add-equipment-item';
import client from '../API/client';
import { useUser } from '../storage/use-user';
import { io } from 'socket.io-client';
import { ioString } from '../API/io';

type EquipmentsProps = StackScreenProps<HomeStackNavigatorParams, 'Equipments'>;

const Equipments = ({}: EquipmentsProps) => {
  const insets = useSafeAreaInsets();

  const [isAdding, setIsAdding] = useState(false);

  const {setSocket, socket, accessToken,type} = useUser(
    state => state,
  );
  const [equipments, setEquipments] = useState<any[]>([]);

  const fetchEquipments = async () => {
  try {
    const response = await client.get(`/${type}/equipments`, {
      headers: {
        authorization: `Bearer ${accessToken}`, // Replace with your actual token
      },
    });
    setEquipments(response.data.equipments.reverse());
  } catch (error) {
    console.error('Error fetching announcements:', error);
  }
}

const establishWebSocketConnection = ()=>{
  if(!socket){
    const newSocket = io(ioString);
    setSocket(newSocket)
    console.log('creating new socket')
  }
  if(socket){
    socket.on('newEquipment', (data: any)=> {
      console.log("New equipmenet added:",data);
      setEquipments((prevEquipments) => [data, ...prevEquipments])
    });
    socket.on('updateEquipment', (data:any)=> {
      console.log("Im here");
      const {oldName,name, price, description, status} = data;
      const newEq = {name, price, description, status};
      setEquipments((prevEquipments)=> {
        const filtered = prevEquipments.filter((item)=> item.name != oldName);
        return [newEq, ...filtered]
      })
    });
    socket.on('deleteEquipment', (data:any)=> {
      const {deletedName} = data; 
      setEquipments((prevEquipments)=>{
        return prevEquipments.filter((item)=> item.name !== deletedName)
      })
    });
  }
}
useEffect(()=>{
  fetchEquipments();
  establishWebSocketConnection();
},[])

  return (
    <View style={styles.screen}>
      <ScreenHeader>Equipments</ScreenHeader>
      <ElevatedCard
        onPress={() => setIsAdding(prevIsAdding => !prevIsAdding)}
        textStyle={styles.elevatedButtonText}
        style={styles.elevatedButtonStyle}>
        Add Equipment
      </ElevatedCard>
      {isAdding && <AddEquipmentItem onSuccess={() => setIsAdding(false)} />}
      <View
        style={[styles.historyContainer, {marginBottom: insets.bottom + 25}]}>
        <View style={styles.whiteCardStyle}>
          <FlatList
            data={equipments}
            ItemSeparatorComponent={ListSeperator}
            renderItem={props => <EquipmentEditableItem {...props} />}
          />
        </View>
      </View>
    </View>
  );
};

export default Equipments;

const styles = StyleSheet.create({
  whiteCardStyle: {
    flex: 1,
    padding: 10,
    backgroundColor: Colors.Gray,
    borderRadius: 25,
  },
  elevatedButtonText: {fontSize: 16, fontWeight: '700', color: Colors.White},
  elevatedButtonStyle: {alignSelf: 'center'},
  screen: {
    flex: 1,
    backgroundColor: Colors.Background,
    paddingHorizontal: 15,
    gap: 25,
  },
  historyContainer: {
    backgroundColor: Colors.VeryLightBlue,
    padding: 25,
    borderRadius: 25,
    flex: 1,
  },
  historyTitle: {
    color: Colors.White,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 24 * 1.2,
  },
  historyTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 10,
  },
  plusContainer: {
    backgroundColor: Colors.Blue,
    borderRadius: 100,
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
