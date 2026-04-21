// import React from 'react'
// import { StyleSheet, Text, View } from 'react-native'

// const Header = (props) => {
//   const { headerHeight } = props
//   return (
//     <>
//       <View
//         style={[
//           styles.subHeader,
//           {
//             height: headerHeight / 2,
//           },
//         ]}
//       >
//         <Text style={styles.conversation}>Conversations</Text>
//       </View>
//       <View
//         style={[
//           styles.subHeader,
//           {
//             height: headerHeight / 2,
//           },
//         ]}
//       >
//         <View style={styles.searchBox}>
//           <Text style={styles.searchText}>Search for messages or users</Text>
//         </View>
//       </View>
//     </>
//   )
// }

// const styles = StyleSheet.create({
//   subHeader: {
//     width: '100%',
//     paddingHorizontal: 10,
//     backgroundColor: '#1c1c1c',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   conversation: { color: 'white', fontSize: 16, fontWeight: 'bold' },
//   searchText: {
//     color: '#8B8B8B',
//     fontSize: 17,
//     lineHeight: 22,
//     marginLeft: 8,
//   },
//   searchBox: {
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     backgroundColor: '#0F0F0F',
//     borderRadius: 10,
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//   },
// })
// export default Header

// {
//   // <View style={{ ...styles.header, height: headerHeight }}>
//   //         {!advancedSearch ? (
//   //           <View style={styles.toggleContainer}>
//   //             {!noUserShows ? (
//   //               <Text>Toggle to hide shows saved to your profile</Text>
//   //             ) : (
//   //               <Text>Toggle to see shows saved to your profile</Text>
//   //             )}
//   //             <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1 }}>
//   //               <View style={{ alignItems: 'flex-start', flex: 1 }}>
//   //                 <Switch
//   //                   style={{
//   //                     marginBottom: 5,
//   //                     marginTop: 5,
//   //                   }}
//   //                   ios_backgroundColor="#3e3e3e"
//   //                   onValueChange={toggleNoUserShows}
//   //                   value={noUserShows}
//   //                 />
//   //               </View>
//   //               <TouchableOpacity
//   //                 // style={styles.button}
//   //                 onPress={() => setAdvancedSearch(true)}
//   //                 style={{ alignItems: 'flex-end', flex: 1 }}
//   //               >
//   //                 <Text
//   //                   style={{
//   //                     marginBottom: 5,
//   //                     marginTop: 5,
//   //                     fontSize: 16,
//   //                     fontWeight: '400',
//   //                   }}
//   //                 >
//   //                   My filters{' '}
//   //                   <MaterialCommunityIcons
//   //                     name="chevron-double-down"
//   //                     size={18}
//   //                   />
//   //                 </Text>
//   //               </TouchableOpacity>
//   //             </View>
//   //             {filter ? (
//   //               <View>
//   //                 <Text style={{ fontWeight: 'bold' }}>
//   //                   The following {noUserShows ? 'additional ' : null}filters
//   //                   have been applied to this search:
//   //                 </Text>
//   //                 <View style={styles.filterDisplay}>{displayFilters()}</View>
//   //                 <View style={{ alignItems: 'flex-end' }}>
//   //                   <TouchableOpacity
//   //                     style={styles.button}
//   //                     onPress={() => setFilter(null)}
//   //                   >
//   //                     <Text style={styles.buttonText}>Cancel filters</Text>
//   //                   </TouchableOpacity>
//   //                 </View>
//   //               </View>
//   //             ) : null}
//   //           </View>
//   //         ) : null}
//   //       </View> */
// }
