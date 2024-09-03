export class Pacient {
  constructor(
    public id: string,
    public name: string,
    public lastname: string,
    public phoneNumber: string
  ) {}

  public setAll(
    id: string,
    name: string,
    lastname: string,
    phoneNumber: string
  ) {
    this.id = id;
    this.name = name;
    this.lastname = lastname;
    this.phoneNumber = phoneNumber;
  }
}
